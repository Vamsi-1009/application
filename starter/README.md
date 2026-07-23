# TinyLink — a runnable companion to the Field Manual

This is the capstone project described in [Stage 18](../docs/18-your-first-build.html) of the [Field Manual](../docs/how-to-build-an-application.html), built for real rather than left as illustrative snippets: an authenticated link shortener whose features map directly back to Stages 03-07 and 17.

**This is separate from `docs/`** — nothing here is served by the live manual at `webstocking.com/application/`. It's a local, runnable project you clone and run on your own machine (or your own VM, following Stages 09-12 if you want to deploy it for real).

## What's here

- [`backend/`](backend) — Node.js + TypeScript + Express + Prisma + PostgreSQL. Signup with email OTP, JWT + rotating refresh tokens, short-link CRUD with ownership checks, rate limiting.
- [`frontend/`](frontend) — React + TypeScript + Vite. In-memory access tokens, silent refresh-on-401, no `dangerouslySetInnerHTML`.

Both are verified to actually work: `npm install` (0 known vulnerabilities in either), `npm run typecheck`, and `npm run build` all pass cleanly, and the backend's test suite (`npm test`) passes — checked before this was committed, not just written and assumed to work.

## Quick start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and a random JWT_SIGNING_KEY
npx prisma migrate dev --name init
npm run dev             # http://localhost:8000

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

No Docker required — install PostgreSQL natively, same as the manual teaches in Stage 05.

## Using this to actually learn

Don't just run it — read the code alongside the stage it implements, then try to break your own rules the way [Stage 17](../docs/17-worked-backend-example.html) describes: can you delete someone else's link? (No — try `DELETE /api/links/:id` with another user's link ID and confirm you get a 403.) Is the OTP actually rate-limited? Is the refresh token really httpOnly? Verifying these yourself, on real running code, is the difference between having read the manual and having understood it.

Once comfortable, extend it: add the per-link custom preview image described in the Stage 18 capstone brief (presigned S3 upload, Stage 08), deploy it behind a load balancer (Stage 10), and wire up CI/CD (Stage 12).
