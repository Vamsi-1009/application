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
