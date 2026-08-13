# Communest

Monorepo with a Vite/React frontend and a Vercel-functions backend.

| | Path | Dev port |
| --- | --- | --- |
| Frontend | [frontend/](frontend/) | 8443 |
| Backend | [backend/](backend/) | 3000 |

## Running both

```bash
pnpm setup   # first time only: installs backend + frontend deps
pnpm dev     # starts both, prefixed output, Ctrl+C stops both
```

Then open http://localhost:8443. Works on macOS, Linux and Windows.

On a fresh clone you also need `backend/.env` — copy
[backend/.env.example](backend/.env.example) and fill in the Supabase values. Env
files are gitignored, so they never arrive with the checkout. The frontend needs no
env file for local work.

Individually: `pnpm dev:frontend` / `pnpm dev:backend`.

## How they talk to each other

- The frontend reads `VITE_API_URL` in [frontend/src/utils/api.ts](frontend/src/utils/api.ts),
  and falls back to `/api` whenever it is running in dev, so no env file is required
  locally. Set `VITE_API_URL` only to point dev at some other backend.
- There is no hardcoded API host anywhere in the source. A production build with no
  `VITE_API_URL` fails in [vite.config.ts](frontend/vite.config.ts) rather than
  shipping a bundle that points at the wrong place.
- Vite proxies `/api` to `http://localhost:3000` (see the `server.proxy` block in
  [frontend/vite.config.ts](frontend/vite.config.ts)), so dev requests are same-origin
  and CORS never enters the picture.
- With no `VITE_API_URL` set, production falls back to the deployed backend URL.

## Backend dev server

`pnpm dev:backend` runs [backend/dev-server.ts](backend/dev-server.ts), a small Node
server that file-routes `backend/api/**` exactly like Vercel does — including `[id]`
params — and restarts on save. It needs no Vercel login or project link.

To run against the real Vercel emulator instead (applies `vercel.json` headers and
rewrites), use `pnpm --dir backend dev:vercel`; that one requires `vercel login` and
`vercel link` first.

Env vars go in `backend/.env` — see [backend/.env.example](backend/.env.example). The
server warns on startup if any Supabase variable is missing.

## Troubleshooting

- **"port already in use"** — Vite runs with `strictPort`, so a leftover dev server
  blocks startup. `pnpm dev` names the offending PID; `kill <pid>` and retry.
- **API calls hit production from localhost** — something set `VITE_API_URL` to an
  absolute URL. Unset it and restart Vite; dev defaults to the proxied `/api`.
- **Backend logs `⚠ missing env`** — `backend/.env` is absent or incomplete. Copy
  `backend/.env.example` and fill it in; the dev server watches `.env` and restarts.
- **Windows: `spawn pnpm ENOENT`** — pnpm isn't on PATH for non-shell spawns. Install
  it globally (`npm install -g pnpm`) and reopen the terminal.
- **`fetch failed` from every route** — `SUPABASE_URL` is wrong. It must be the
  `https://<project-ref>.supabase.co` value from the Supabase dashboard (`.co`, not
  `.com`), and the ref must match the one in `DATABASE_URL`.

## Deploying to Vercel

This repo holds **two separate Vercel projects**, both pointed at the same
repository with different Root Directory settings:

| Project | Root Directory | Serves |
| --- | --- | --- |
| `communest` | `frontend` | The Vite SPA |
| `communest-backend` | `backend` | `/api/*` serverless functions + a stub landing page |

Set the Root Directory in Project Settings → General. The root `package.json` and
`dev.mjs` exist only for local development and are ignored by both deployments.

### Environment variables

Set these in the backend project (Settings → Environment Variables) for every
environment you deploy:

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` — the host is `.co`, not `.com` |
| `SUPABASE_ANON_KEY` | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret — server-side only |
| `CLIENT_URL` | Optional; comma-separated extra CORS origins (e.g. a preview URL) |

The frontend project normally needs **no** dashboard variables — its one setting,
`VITE_API_URL`, is committed in [frontend/.env.production](frontend/.env.production).
Add it in the dashboard only to override that for a specific environment (a preview
pointing at a staging backend, say); a dashboard value always wins over the file.

### Where each variable lives, and why

Environment variables on Vercel are **per project, not per repository**. Two projects
means two separate lists — the frontend never sees the backend's Supabase keys, which
is the point: `VITE_*` values are compiled into JavaScript that ships to browsers.

| | Frontend project | Backend project |
| --- | --- | --- |
| Applied | At build time, baked into the bundle | At runtime, inside the function |
| Visible to users | **Yes** — readable in devtools | No |
| Safe for secrets | **Never** | Yes |
| Variables | `VITE_API_URL` (public URL) | `SUPABASE_*`, `CLIENT_URL` |

So the service-role key goes in the backend project only. Putting it in the frontend
project — or naming anything secret `VITE_…` — publishes it.

### Resolution order for the frontend

1. Vercel dashboard variable (per environment) — wins over everything
2. `frontend/.env.production` — the committed default for deploys
3. `frontend/.env.local` — your machine only, gitignored, for dev overrides
4. Dev fallback: `/api` through the Vite proxy
5. Nothing → the production build fails with an explicit error

### Setting the backend variables

Via dashboard: Backend project → Settings → Environment Variables → add each for
Production, Preview and Development. Or from the CLI, in `backend/`:

```bash
vercel link                                   # once, connects the folder to the project
vercel env add SUPABASE_URL production        # repeat per variable and environment
vercel env pull .env                          # pulls them back down into a local .env
```

`vercel env pull` is the tidiest way to set up a second machine: it writes a `.env`
with the real values instead of copying secrets around by hand.

### Notes on the config

- CORS is emitted per-response by [backend/lib/auth.ts](backend/lib/auth.ts). The
  backend `vercel.json` intentionally sets **no** CORS headers — two sources would
  send a duplicate `Access-Control-Allow-Origin`, which browsers reject.
- The backend uses zero-config function detection: every `api/**/*.ts` file becomes
  a serverless function automatically. No `builds` or `routes` entries are needed,
  and `routes` cannot coexist with `headers`/`rewrites` anyway.
- `frontend/index.html` must point at `/src/main.tsx`. If a Figma export ever
  rewrites it to reference a prebuilt `/assets/index-*.js`, the deployed site
  silently freezes at that snapshot and ignores all source changes.
