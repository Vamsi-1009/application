# TinyLink backend

The capstone project from [Stage 20](../../docs/20-your-first-build.html) of the Field Manual, built for real: Node.js + TypeScript + Express + Prisma + PostgreSQL, implementing the auth/OTP, database, and API patterns taught in Stages 03-06 and 18.

## What it does

- Sign up with email + password, verified via a 6-digit OTP code
- Log in with a short-lived JWT access token + a rotating, httpOnly-cookie refresh token
- Create/list/delete short links, each tied to your account with an ownership check
- A public `GET /:code` redirect endpoint that increments a click counter
- Rate limiting on auth, OTP, and the public redirect endpoint

## Running it locally (no Docker)

1. Install PostgreSQL locally and create a database:
   ```bash
   createdb tinylink
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env file and fill in `DATABASE_URL` (and a random 32+ char `JWT_SIGNING_KEY`):
   ```bash
   cp .env.example .env
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

No `SMTP_*` variables? OTP codes are logged to the console instead of emailed — see `src/lib/mailer.ts`. Fine for local dev, never for production (Stage 06 covers a real SPF/DKIM/DMARC setup).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with auto-reload |
| `npm run typecheck` | Type-check without emitting files |
| `npm run build` | Compile to `dist/` |
| `npm test` | Run the test suite |
| `npm run prisma:migrate` | Create/apply a migration |

## API

| Method & path | Auth | What it does |
|---|---|---|
| `POST /api/auth/signup` | - | `{ email, password }` → sends an OTP |
| `POST /api/auth/verify-otp` | - | `{ email, code }` → activates the account |
| `POST /api/auth/resend-otp` | - | `{ email }` |
| `POST /api/auth/login` | - | `{ email, password }` → `{ accessToken, user }` + refresh cookie |
| `POST /api/auth/refresh` | cookie | rotates the refresh token, returns a new access token |
| `POST /api/auth/logout` | cookie | revokes the refresh token |
| `POST /api/links` | bearer | `{ targetUrl }` → creates a short link |
| `GET /api/links` | bearer | paginated list of your own links |
| `DELETE /api/links/:id` | bearer | ownership-checked delete |
| `GET /:code` | - | 302 redirect to the target URL, increments click count |

## Where each file's reasoning comes from

This isn't just illustrative code — every non-obvious decision here is explained in the manual:

- Argon2id hashing, JWT algorithm pinning, rotating refresh tokens → Stage 05
- The exact middleware order in `app.ts`, CORS, ownership checks → Stage 03 and Stage 18
- OTP generation/hashing/rate-limiting → Stage 06
- Schema design, unique constraints, migrations → Stage 04
- Presigned-URL upload pattern → not implemented here (TinyLink has no file upload) — see Stage 07 if you extend this with link preview images
