# application

A field manual for building an application end-to-end — frontend, backend, database, auth/OTP, secrets, storage/CDN, VMs, load balancers, domains, CI/CD, monitoring — with security woven into every stage instead of bolted on at the end.

## Live site

**https://webstocking.com/application/**

Deployed on an Ubuntu VM behind Nginx, served as plain static files (no build step). Every push to `main` auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`) — see [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full deployment setup, the security hardening applied on the VM (restricted deploy key, security headers, HSTS, hidden server version), and how to redeploy or rebuild from scratch.

## Contents

- [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html) — **start here.** The landing page: animated hero, intro, and a full directory linking to every stage below.
- The manual is split into one page per stage (each links to the next/previous via a footer nav at the bottom):
  1. [`01-plan-and-threat-model.html`](docs/01-plan-and-threat-model.html)
  2. [`02-frontend.html`](docs/02-frontend.html)
  3. [`03-backend-api.html`](docs/03-backend-api.html)
  4. [`04-database.html`](docs/04-database.html) — structure, scaling (replication/sharding/consistent hashing, referencing Alex Xu's *System Design Interview*), and how databases actually get attacked
  5. [`05-auth-otp-secrets.html`](docs/05-auth-otp-secrets.html)
  6. [`06-email-otp-delivery.html`](docs/06-email-otp-delivery.html)
  7. [`07-storage-cdn.html`](docs/07-storage-cdn.html)
  8. [`08-servers-vm.html`](docs/08-servers-vm.html)
  9. [`09-load-balancing-autoscaling.html`](docs/09-load-balancing-autoscaling.html)
  10. [`10-domains-dns.html`](docs/10-domains-dns.html)
  11. [`11-cicd.html`](docs/11-cicd.html)
  12. [`12-monitoring-incident-response.html`](docs/12-monitoring-incident-response.html)
  13. [`13-security-checklist.html`](docs/13-security-checklist.html) — consolidated security checklist across every stage
  14. [`14-compliance.html`](docs/14-compliance.html) — including India-specific: DPDP Act, CERT-In, RBI
  15. [`15-skill-roadmap.html`](docs/15-skill-roadmap.html) — junior → staff/principal
  16. [`16-glossary.html`](docs/16-glossary.html)
  17. [`17-full-resource-catalog.html`](docs/17-full-resource-catalog.html) — all 103 catalog entries, grouped, explained, and linked (not just reprinted)
  18. [`18-worked-backend-example.html`](docs/18-worked-backend-example.html) — a real backend file tree walked through file by file, plus how to have an AI audit finished code against the catalog
  19. [`19-reliability-and-disaster-recovery.html`](docs/19-reliability-and-disaster-recovery.html) — redundancy, database failover, backups done properly, DDoS protection, and disaster recovery (RTO/RPO, runbooks, tested drills)
  20. [`20-your-first-build.html`](docs/20-your-first-build.html) — a linear, checkable build-order checklist through every stage, plus a capstone project (TinyLink) that touches all of them
  21. [`21-linux-fundamentals.html`](docs/21-linux-fundamentals.html) — filed last, but read it right after Stage 01 if the terminal is new to you: filesystem, permissions, pipes/redirection, processes, networking, and the commands every other stage assumes
- [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) — the original standalone 103-entry catalog of security standards/frameworks (OWASP, MITRE ATT&CK/CWE/CAPEC, CIS Benchmarks, NIST, and more) that Stage 17 explains and links out to individually.
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — VM deployment steps, GitHub Actions auto-deploy setup, and applied security hardening.
- [`starter/`](starter) — **TinyLink**, a real runnable companion codebase implementing the Stage 20 capstone project: Node.js/TypeScript/Express/Prisma/PostgreSQL backend + React/TypeScript/Vite frontend, verified to install (0 known vulnerabilities), type-check, build, and pass its test suite. Separate from `docs/` — not part of the deployed manual, a local project you clone and run yourself.
- [`CLAUDE.md`](CLAUDE.md) — notes for future work in this repo: what exists, why, and decisions made along the way.

## How to read it

Open `docs/how-to-build-an-application.html` first (or visit the live link above) — it's the front door, with an animated hero and a full directory of every stage. The landing page's "How to use this manual" section has a **recommended order** list: start at Stage 01, then read Stage 21 (Linux fundamentals) right after it if the terminal is new to you — it's filed last by number but belongs near the start — then continue 02→19, finishing with Stage 20's build checklist and capstone. Each page is full-width with a prev/next footer nav to read straight through in order, or jump to any single stage directly from the landing page's contents grid. Each stage ends with an amber **security checklist** box tying it to a named standard, and stages with India-specific considerations have a teal **IN** note. No build step, no server needed to view it locally — every page also opens directly in a browser from disk.

Also available on every page: a floating search button (or `Ctrl/Cmd-K`) to jump to any stage, a home button to get back to the landing page, hover-revealed anchor links on every subheading, and a "mark this stage complete" toggle that feeds a progress bar back on the landing page (all client-side, no account needed).
