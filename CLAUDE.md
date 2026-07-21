# CLAUDE.md

Notes for whoever (human or Claude) picks this repo up next.

## What this repo is

A multi-page HTML "field manual" teaching how to build an application end-to-end — frontend, backend, database (structure, scaling, and attacks), auth/OTP, secrets management, email delivery, file storage/CDN, VMs, load balancers/autoscaling, domains, CI/CD, monitoring, security, and compliance (including India-specific: DPDP Act 2023, CERT-In). It is a teaching document, not a runnable app.

Landing page: [`docs/how-to-build-an-application.html`](docs/how-to-build-an-application.html) (hero + "how to use this manual" + a full directory of every stage). Each stage is its own HTML file (`docs/01-plan-and-threat-model.html` through `docs/18-worked-backend-example.html` — see README.md for the full list), sharing one CSS/JS design system generated from a single source of truth (see "Multi-page structure" below). Companion reference: [`docs/security/master_cybersecurity_checks_resources.html`](docs/security/master_cybersecurity_checks_resources.html) (a local copy of a 103-row security standards/tooling catalog the user supplied; Stage 17 explains and links every row individually instead of just embedding this file, and the manual's inline checklist items cite rows from it by standard name, e.g. `OWASP API Security · BOLA`, `CWE-89`).

## Multi-page structure — how it's generated

The manual was originally one long single-page HTML file, then split into one file per stage at the user's request ("frontend on the next page, backend next page, other things to the next page"). The split was done with a Node script (not committed to the repo — it was a one-off scratch tool) that:
1. Parsed the single-page source for its shared `<style>` block, the hero markup, and each `<section class="stage" id="sN">...</section>` block.
2. Wrote one HTML file per section into `docs/`, each with the full shared CSS/JS inlined (progress bar, mobile drawer, scroll-reveal, back-to-top, TOC filter — same behavior as the original, minus the in-page scroll-spy since each page is now one section), a rail nav listing every page with the current page's link marked `active` at generation time (no runtime detection needed), and a prev/next footer nav computed from stage order.
3. The landing page (`how-to-build-an-application.html`) additionally gets the hero and a generated "full contents" grid linking every stage with its number and one-line dek.

If asked to regenerate all pages from a single edited source, or to add a new stage: either hand-edit each affected file directly (they're independent, self-contained HTML files — no build step, no shared included files), or rewrite a similar one-off Node script if bulk-regenerating from a merged source is easier. There is no persistent build pipeline by design — these are meant to stay plain, dependency-free HTML files.

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
