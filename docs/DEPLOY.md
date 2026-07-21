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

## Security hardening — applied on the VM

These live in server config, not the git repo, so they were applied directly
over SSH rather than via a commit. Current state, confirmed live:

1. **GitHub Actions deploy key is restricted to only the deploy command.**
   `~/.ssh/authorized_keys` on the VM has a forced `command="cd
   /home/vamsi/Documents/application && git fetch origin main && git reset
   --hard origin/main"` prefix (plus `no-port-forwarding,no-agent-forwarding,
   no-X11-forwarding,no-pty`) on the `github-actions-deploy` key. Even with
   full possession of the private key, it can only ever run that one
   command — not get an interactive shell.

2. **Nginx no longer leaks its exact version.** `server_tokens off;` is set
   in `/etc/nginx/nginx.conf`. `curl -I` now returns `Server: nginx` with no
   version number.

3. **Security headers are live** on the `/application/` location: `X-Content-
   Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
   and a `Content-Security-Policy` scoped to `'self'` (with `'unsafe-inline'`
   for script/style, since every page's CSS/JS is intentionally inline with
   no build step — a stricter CSP would need per-page nonces, not worth the
   complexity for a static site with no user input).

4. **HSTS is enabled** (`Strict-Transport-Security: max-age=31536000;
   includeSubDomains`), safe since HTTP already unconditionally redirects to
   HTTPS.

Verify anytime with:
```bash
curl -sI https://webstocking.com/application/
```

### Incident note: a leaked private key, found and rotated during this pass

While restricting the deploy key, a **different, unrelated private key**
(comment `webstocking-server`, of unknown origin — predates this project)
was discovered sitting in plaintext inside `~/.ssh/authorized_keys`, which
should only ever contain public keys. It was removed, `authorized_keys` was
rebuilt from scratch with only the legitimate personal key, and the
`github-actions-deploy` keypair was regenerated fresh (old key files deleted,
new pair generated, `VM_SSH_KEY` GitHub secret updated to match). If that
`webstocking-server` key is ever identified as authorizing access somewhere
else (another server, another service), treat it as compromised and rotate
it there too — it was exposed both in the file and in a chat transcript
during troubleshooting.
