# CLAUDE.md

Notes for whoever (human or Claude) picks this repo up next.

## What this repo is

A single-page HTML "field manual" teaching how to build an application end-to-end — frontend, backend, database, auth/OTP, secrets management, email delivery, file storage/CDN, VMs, load balancers/autoscaling, domains, CI/CD, monitoring, security, and compliance (including India-specific: DPDP Act 2023, CERT-In). It is a teaching document, not a runnable app.

Primary file: [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html). Companion reference: [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) (a local copy of a 103-row security standards/tooling catalog the user supplied; the manual's checklist items cite rows from it by standard name, e.g. `OWASP API Security · BOLA`, `CWE-89`).

## History / how this ended up this way

The user's first message was ambiguous — it read as "build a full project (frontend, backend, deployment, VM, CDN, email/OTP, password wallet, load balancers, autoscaling, domains) that teaches the whole process." I asked clarifying questions, then built an actual working project ("PixelGram," an Instagram-style app) as three parallel agent builds: a Node.js/TypeScript/Express/Prisma/PostgreSQL backend, a React/TypeScript/Vite frontend, and Terraform + Nginx + systemd infra-as-code with a matching numbered tutorial doc set — all of it real, working code that type-checked and built cleanly.

The user then corrected: they wanted a **teaching page**, not a built project. I asked what to do with the generated code; the answer was **delete it** and produce **a single HTML page** instead. The `backend/`, `frontend/`, `infra/` directories and the app-specific tutorial docs (`docs/00-overview.md` through `docs/17-...md`, `docs/SECURITY.md`) were deleted. Only `docs/security/master_cybersecurity_checks_resources.html` (the user's own reference file, copied locally per their request) was kept, and the new standalone manual was written to replace everything else.

## Decisions baked into the manual's content

- Stack recommendations given in the manual (Node.js+TypeScript+Express or FastAPI for backend, React+TypeScript+Vite/Next.js for frontend, PostgreSQL, AWS as the cloud target) are **illustrative defaults for teaching purposes**, not a mandate — the doc says as much.
- No Docker/container content anywhere, per explicit user instruction (VMs are hardened and run the app via systemd directly).
- "Password wallet" is explicitly disambiguated in the manual (Stage 05) as **application secrets management** (AWS Secrets Manager / Vault for the app's own credentials), distinct from a per-user password-vault product feature, since the original phrase was ambiguous and most real apps mean the former.
- India-specific compliance content (DPDP Act 2023, CERT-In 6-hour incident reporting + log-retention directions, RBI rules for payments) was added in Stage 14 since the user asked for something usable "all over India."
- Design treatment: dark blueprint-navy palette with an amber/teal accent pair, monospace headings (technical/blueprint annotation feel) paired with a serif body face for long-form reading — chosen deliberately to avoid generic AI-page defaults (no cream+terracotta, no purple-gradient hero). Both light and dark themes are implemented via CSS custom properties.

## If asked to extend this

- Add new stages/sections directly in `docs/how-to-build-an-application.html` — it's self-contained (inline CSS/JS, no build step, no external font/script CDNs).
- If the user ever asks to actually *build* PixelGram (or any concrete app) again as real code, treat that as a new, separate request — confirm scope again before generating a full codebase, given the earlier scope mismatch in this project's history.
