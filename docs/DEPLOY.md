# Deploying to the VM

The site is plain static HTML in `docs/`, served by Nginx on the VM at
`https://webstocking.com/application/`. `.github/workflows/deploy.yml`
auto-deploys on every push to `main` by SSHing into the VM and running
`git fetch` + `git reset --hard origin/main` inside the cloned repo.

## One-time VM setup (already done on the current VM — keep this for rebuilds)

1. **Clone the repo** on the VM as the `vamsi` user:
   ```bash
   cd ~/Documents
   git clone https://github.com/Vamsi-1009/application.git
   ```
2. **Make it readable by Nginx** (it lives under a home directory, which Nginx can't traverse into by default):
   ```bash
   chmod o+x /home/vamsi
   chmod o+x /home/vamsi/Documents
   chmod -R o+rX /home/vamsi/Documents/application
   ```
3. **Nginx**: the app is served via a `location /application/ { alias .../docs/; }` block added to the VM's existing `webstocking.com` Nginx config (the domain already runs another app at the root, with its own SSL cert already issued via Let's Encrypt — no separate cert or Nginx site file needed for this manual).

## One-time GitHub Actions setup (do this once per VM/repo)

1. **Generate a dedicated deploy keypair on the VM** — this key exists only so GitHub Actions can SSH in and pull; it is separate from any personal SSH key:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/gha_deploy -N "" -C "github-actions-deploy"
   cat ~/.ssh/gha_deploy.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
2. **Print the private key** and copy the entire output, including the `-----BEGIN...-----`/`-----END...-----` lines:
   ```bash
   cat ~/.ssh/gha_deploy
   ```
3. In the GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret** and add four secrets:
   | Name | Value |
   |---|---|
   | `VM_HOST` | the VM's public IP |
   | `VM_PORT` | the SSH port (a non-default port here) |
   | `VM_USER` | the VM username the repo is cloned under |
   | `VM_SSH_KEY` | the private key printed in step 2 (whole thing) |
4. Push anything to `main` (or use the **Run workflow** button under the Actions tab) and check the **Actions** tab — the "Deploy to VM" run should go green. If it fails, the step's log shows the SSH/git error directly.

## Manual deploy (fallback, no Actions needed)
```bash
ssh -p <port> vamsi@<vm-ip>
cd ~/Documents/application && git pull
```

## Security hardening still to apply on the VM

These are real findings from a security pass on the live deployment — they
live in server config, not the git repo, so pushing code can't fix them.
Run these once, over SSH:

1. **Restrict the GitHub Actions deploy key to only the deploy command.**
   As set up, `~/.ssh/authorized_keys` grants that key a full interactive
   shell as `vamsi` (who has sudo) — if the `VM_SSH_KEY` GitHub secret
   ever leaked, whoever has it gets much more than "run git pull." Lock
   it down to a forced command with no port/agent/X11 forwarding and no
   pty:
   ```bash
   nano ~/.ssh/authorized_keys
   ```
   Find the line ending in `github-actions-deploy` and prefix it with:
   ```
   command="cd /home/vamsi/Documents/application && git fetch origin main && git reset --hard origin/main",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA...github-actions-deploy
   ```
   (keep the existing `ssh-ed25519 AAAA...` key material exactly as-is — only add the `command="...",no-port-forwarding,...` prefix in front of it). After this, that key can *only* ever run the deploy command, nothing else, even with full possession of the private key.

2. **Stop leaking the exact Nginx/OS version.** `curl -I` against the live
   site currently returns `Server: nginx/1.24.0 (Ubuntu)` — free
   reconnaissance for an attacker matching known CVEs to your exact
   version. Add one line to the top of `/etc/nginx/nginx.conf`, inside
   the `http { }` block:
   ```bash
   sudo nano /etc/nginx/nginx.conf
   ```
   ```nginx
   http {
       server_tokens off;
       ...
   }
   ```
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Confirm: `curl -I https://webstocking.com/application/` should now show just `Server: nginx` with no version number.

3. **Add security headers** to the `/application/` location block (edit
   `/etc/nginx/sites-enabled/webstocking.com`, inside the `location
   /application/ { ... }` block added earlier):
   ```nginx
   location /application/ {
       alias /home/vamsi/Documents/application/docs/;
       index how-to-build-an-application.html;
       try_files $uri $uri/ =404;

       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self'" always;
   }
   ```
   (`'unsafe-inline'` is needed because every page's CSS/JS is intentionally inline with no build step — a real strict CSP would need nonces, which isn't worth the complexity for a static content site with no user input.)

4. **Enable HSTS** — HTTPS is already fully enforced (HTTP redirects to
   HTTPS), so this is a safe addition. Add inside the `server { listen
   443 ssl; ... }` block, near the other `ssl_*` directives:
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```
   Then:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
