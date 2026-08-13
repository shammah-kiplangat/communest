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

Then open http://localhost:8443.

Individually: `pnpm dev:frontend` / `pnpm dev:backend`.

## How they talk to each other

- The frontend reads `VITE_API_URL` in [frontend/src/utils/api.ts](frontend/src/utils/api.ts).
  [frontend/.env.local](frontend/.env.example) sets it to `/api` for development.
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
- **API calls hit production from localhost** — `frontend/.env.local` is missing or
  doesn't set `VITE_API_URL=/api`. Restart Vite after changing it.
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

The frontend needs no dashboard variables: `VITE_API_URL` is set in
[frontend/vercel.json](frontend/vercel.json) under `build.env`. Change it there if
the backend moves to another domain.

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
