# application

A field manual for building an application end-to-end — frontend, backend, database, auth/OTP, secrets, storage/CDN, VMs, load balancers, domains, CI/CD, monitoring — with security woven into every stage instead of bolted on at the end.

## Contents

- [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html) — **start here.** The landing page: intro, how to use the manual, and a full directory linking to every stage below.
- The manual is split into one page per stage (each links to the next/previous via a footer nav, and all pages share the same sidebar):
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
- [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) — the original standalone 103-entry catalog of security standards/frameworks (OWASP, MITRE ATT&CK/CWE/CAPEC, CIS Benchmarks, NIST, and more) that Stage 17 explains and links out to individually.
- [`CLAUDE.md`](CLAUDE.md) — notes for future work in this repo: what exists, why, and decisions made along the way.

## How to read it

Open `docs/how-to-build-an-application.html` first — it's the front door, with a full directory of every stage. Each page has the same sidebar (jump to any stage, filter by keyword) and a prev/next footer nav to read straight through. Each stage ends with an amber **security checklist** box tying it to a named standard, and stages with India-specific considerations have a teal **IN** note. No build step, no server needed — every page opens directly in a browser.
