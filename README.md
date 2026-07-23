# application

A field manual for building an application end-to-end — frontend, backend, database, auth/OTP, secrets, storage/CDN, VMs, load balancers, domains, CI/CD, monitoring — with security woven into every stage instead of bolted on at the end.

## Live site

**https://webstocking.com/application/**

Deployed on an Ubuntu VM behind Nginx, served as plain static files (no build step). Every push to `main` auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`) — see [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full deployment setup, the security hardening applied on the VM (restricted deploy key, security headers, HSTS, hidden server version), and how to redeploy or rebuild from scratch.

## Contents

- [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html) — **start here.** The landing page: animated hero, intro, and a full directory linking to every stage below.
- The manual is split into one page per stage (each links to the next/previous via a footer nav at the bottom):
  1. [`01-plan-and-threat-model.html`](docs/01-plan-and-threat-model.html)
  2. [`02-linux-fundamentals.html`](docs/02-linux-fundamentals.html) — read this right after Stage 01 if the terminal is new to you: filesystem, permissions, pipes/redirection, processes, networking, and the commands every later stage assumes
  3. [`03-frontend.html`](docs/03-frontend.html)
  4. [`04-backend-api.html`](docs/04-backend-api.html)
  5. [`05-database.html`](docs/05-database.html) — structure, scaling (replication/sharding/consistent hashing, referencing Alex Xu's *System Design Interview*), and how databases actually get attacked
  6. [`06-auth-otp-secrets.html`](docs/06-auth-otp-secrets.html)
  7. [`07-email-otp-delivery.html`](docs/07-email-otp-delivery.html)
  8. [`08-storage-cdn.html`](docs/08-storage-cdn.html)
  9. [`09-servers-vm.html`](docs/09-servers-vm.html)
  10. [`10-load-balancing-autoscaling.html`](docs/10-load-balancing-autoscaling.html)
  11. [`11-domains-dns.html`](docs/11-domains-dns.html)
  12. [`12-cicd.html`](docs/12-cicd.html)
  13. [`13-monitoring-incident-response.html`](docs/13-monitoring-incident-response.html)
  14. [`14-reliability-and-disaster-recovery.html`](docs/14-reliability-and-disaster-recovery.html) — redundancy, database failover, backups done properly, DDoS protection, and disaster recovery (RTO/RPO, runbooks, tested drills)
  15. [`15-security-checklist.html`](docs/15-security-checklist.html) — consolidated security checklist across every stage
  16. [`16-compliance.html`](docs/16-compliance.html) — including India-specific: DPDP Act, CERT-In, RBI
  17. [`17-worked-backend-example.html`](docs/17-worked-backend-example.html) — a real backend file tree walked through file by file, plus how to have an AI audit finished code against the catalog
  18. [`18-your-first-build.html`](docs/18-your-first-build.html) — a linear, checkable build-order checklist through every stage, plus a capstone project (TinyLink) that touches all of them
  19. [`19-skill-roadmap.html`](docs/19-skill-roadmap.html) — junior → staff/principal
  20. [`20-glossary.html`](docs/20-glossary.html)
  21. [`21-full-resource-catalog.html`](docs/21-full-resource-catalog.html) — all 103 catalog entries, grouped, explained, and linked (not just reprinted)
- [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) — the original standalone 103-entry catalog of security standards/frameworks (OWASP, MITRE ATT&CK/CWE/CAPEC, CIS Benchmarks, NIST, and more) that Stage 21 explains and links out to individually.
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — VM deployment steps, GitHub Actions auto-deploy setup, and applied security hardening.
- [`starter/`](starter) — **TinyLink**, a real runnable companion codebase implementing the Stage 18 capstone project: Node.js/TypeScript/Express/Prisma/PostgreSQL backend + React/TypeScript/Vite frontend, verified to install (0 known vulnerabilities), type-check, build, and pass its test suite. Separate from `docs/` — not part of the deployed manual, a local project you clone and run yourself.
- [`CLAUDE.md`](CLAUDE.md) — notes for future work in this repo: what exists, why, and decisions made along the way.

## How to read it

Open `docs/how-to-build-an-application.html` first (or visit the live link above) — it's the front door, with an animated hero and a full directory of every stage. The stages are numbered in the order you actually read them: start at Stage 01, then Stage 02 (Linux fundamentals) if the terminal is new to you, then straight through 03→21, with Stage 18's build checklist and capstone as the finish line. Each page is full-width with a prev/next footer nav to read straight through in order, or jump to any single stage directly from the landing page's contents grid. Each stage ends with an amber **security checklist** box tying it to a named standard, and stages with India-specific considerations have a teal **IN** note. No build step, no server needed to view it locally — every page also opens directly in a browser from disk.

Also available on every page: a floating search button (or `Ctrl/Cmd-K`) to jump to any stage, a home button to get back to the landing page, hover-revealed anchor links on every subheading, and a "mark this stage complete" toggle that feeds a progress bar back on the landing page (all client-side, no account needed).
