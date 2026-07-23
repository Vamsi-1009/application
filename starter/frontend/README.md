# TinyLink frontend

React + TypeScript + Vite, implementing the frontend patterns taught in Stage 03 of the [Field Manual](../../docs/18-your-first-build.html) — in-memory access tokens, silent refresh-on-401, and no `dangerouslySetInnerHTML` anywhere.

## Running it locally

1. Make sure the [backend](../backend) is running first (defaults to `http://localhost:8000`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env file (defaults are already correct for local dev):
   ```bash
   cp .env.example .env
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173`, sign up, check the backend's terminal output for your OTP code (unless you configured real SMTP), verify, log in, and create your first short link.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run typecheck` | Type-check without emitting files |
| `npm run build` | Type-check, then build to `dist/` |

## Security decisions, and why

- **Access token in memory only** (`src/lib/apiClient.ts`), never `localStorage` — an XSS bug can't steal it if it's never written to a place JavaScript-readable storage APIs can reach. See Stage 03.
- **Refresh token never touched by the frontend at all** — it's an httpOnly cookie the backend sets; `credentials: "include"` sends it automatically.
- **Client-side validation is UX only.** The password-length check on signup, for example, doesn't replace the backend's own validation — it just gives faster feedback.
- **No `dangerouslySetInnerHTML` anywhere.** User-entered content (URLs, emails) is rendered through normal JSX, which escapes it by default.
