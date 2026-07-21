# application

A field manual for building an application end-to-end — frontend, backend, database, auth/OTP, secrets, storage/CDN, VMs, load balancers, domains, CI/CD, monitoring — with security woven into every stage instead of bolted on at the end.

## Contents

- [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html) — the manual itself. Open it in a browser. Covers, in build order:
  planning & threat modeling → frontend → backend/API → database → auth/OTP/secrets → email delivery → file storage/CDN → VMs → load balancers/autoscaling → domains/DNS → CI/CD → monitoring/incident response → a consolidated security checklist → compliance (including India-specific: DPDP Act, CERT-In) → a junior-to-staff skill roadmap → a glossary.
- [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) — the standalone 103-entry catalog of security standards, frameworks, and vulnerability-intelligence sources (OWASP, MITRE ATT&CK/CWE/CAPEC, CIS Benchmarks, NIST, cloud/supply-chain/identity standards, and more) that the manual's checklists cite by name. Also embedded live inside the manual's final section.
- [`CLAUDE.md`](CLAUDE.md) — notes for future work in this repo: what exists, why, and decisions made along the way.

## How to read it

Open `docs/how-to-build-an-application.html` directly in any browser (no build step, no server needed). Use the left rail to jump to a stage, or the filter box to narrow it down. Each stage ends with an amber **security checklist** box tying it to a named standard, and stages with India-specific considerations (compliance, providers) have a teal **IN** note.
