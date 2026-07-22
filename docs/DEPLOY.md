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

**⚠️ This VM hosts more than one project (see "Incident: key-naming collision" below). Never name a deploy key `gha_deploy` or comment it just `github-actions-deploy` — those generic names have already collided once with another project on this same box. Always suffix with the project name**, e.g. `gha_deploy_application` / `github-actions-deploy-application`, as done below.

1. **Generate a dedicated, uniquely-named deploy keypair on the VM** — this key exists only so GitHub Actions can SSH in and pull; it is separate from any personal SSH key and from any other project's deploy key:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/gha_deploy_application -N "" -C "github-actions-deploy-application"
   ```
2. **Append it to `authorized_keys` as a forced command, scoped only to this repo's path** — never overwrite the file, only append, and never touch lines belonging to other projects:
   ```bash
   printf 'command="cd /home/vamsi/Documents/application && git fetch origin main && git reset --hard origin/main",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty %s\n' "$(cat ~/.ssh/gha_deploy_application.pub)" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
3. **Print the private key** and copy the entire output, including the `-----BEGIN...-----`/`-----END...-----` lines:
   ```bash
   cat ~/.ssh/gha_deploy_application
   ```
4. In the GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret** and add four secrets:
   | Name | Value |
   |---|---|
   | `VM_HOST` | the VM's public IP |
   | `VM_PORT` | the SSH port (a non-default port here) |
   | `VM_USER` | the VM username the repo is cloned under |
   | `VM_SSH_KEY` | the private key printed in step 3 (whole thing) |

   If updating an existing secret rather than creating one, **delete it and re-add it fresh** rather than trusting "Update" — a bad paste is otherwise invisible (GitHub never lets you view a secret's value again to double check it).
5. **Verify it actually works — don't trust a green checkmark alone.** GitHub Actions reporting "success" only proves the SSH session completed; if the key matches the *wrong* `authorized_keys` line (see incident below), a forced command for a *different* project can run instead, still exit 0, and still show green while doing nothing to this repo. Prove it end-to-end: push a trivial, visually-checkable change (e.g. a one-word footer edit) with **no manual SSH from anyone**, then `curl` the live site and confirm the change actually landed.

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
   no-X11-forwarding,no-pty`) on the **`github-actions-deploy-application`**
   key (renamed from the original `github-actions-deploy` after the naming
   collision below). Even with full possession of the private key, it can
   only ever run that one command — not get an interactive shell.

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

### Incident note: deploy key name collided with another project ("medical-scanner")

**This VM runs more than one project.** A separate, unrelated app called
"medical-scanner" (`/home/vamsi/apps/Medical_scanner`, proxied at
`webstocking.com`'s root — see the shared-domain note above) is also being
developed on this same VM, in a separate session. That session generated its
own deploy keypair using the same generic filename we'd used
(`~/.ssh/gha_deploy`) and the same `authorized_keys` comment
(`github-actions-deploy`), which overwrote both our key file and our
`authorized_keys` line with its own — pointed at
`command="cd /home/vamsi/apps/Medical_scanner && bash deploy/deploy.sh"`.

**Symptom:** this repo's GitHub Actions workflow kept reporting green
("success") on every run, but the live site never actually updated. The
job log showed our exact intended command (`cd .../application && git fetch
&& git reset --hard`) was sent, but the *output* was 100% medical-scanner's
build (`vite build`, `Publishing to /var/www/medical-scanner`) — proof the
SSH connection was authenticating against medical-scanner's forced-command
line, not ours, silently running the wrong deploy while still exiting 0.
A green checkmark alone does not prove a deploy actually happened when a
forced SSH command can be silently swapped like this.

**Fix:** generated a new keypair with a project-specific name
(`gha_deploy_application` / comment `github-actions-deploy-application`),
appended it as a *new* line in `authorized_keys` without touching
medical-scanner's line, and updated this repo's `VM_SSH_KEY` GitHub secret
to the new key — **deleting and re-adding the secret** rather than trusting
"Update," since the first re-paste attempt silently kept the old value.
Verified by pushing a one-word, visually-distinct footer change with zero
manual SSH from anyone and confirming it appeared on the live site.

**Takeaway for future work on this VM:** never use a generic key name or
`authorized_keys` comment for a new deploy key here — always suffix it with
the project name, and after any key change, verify with a real content diff
on the live site, not just a green Actions run.
