# Deploying OinkBooks v2

Three pieces, three hosts (all free-tier friendly):

| Piece | Host | Notes |
| --- | --- | --- |
| Angular app (`apps/web`) | **Vercel** | static + CDN; SPA rewrite in `vercel.json` |
| NestJS API (`apps/api`) | **Render** (free Web Service) | persistent Node process; **sleeps after ~15 min idle** (cold start on next hit) |
| Postgres | **Neon** (free) | serverless Postgres; use the **pooled** connection string |

Deploy order: **Neon → Render → Vercel** (each needs the previous one's URL).

## 1. Neon (Postgres)

1. Create a project at neon.tech → copy the **pooled** connection string
   (host contains `-pooler`), e.g.
   `postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/oinkbooks?sslmode=require`
2. That's it — migrations run automatically from Render's build (step 2).

> The app disables prepared statements (`prepare: false` in `db.module.ts`) so
> it works through Neon's pgBouncer pooler.

## 2. Render (API)

Deploy via the included `render.yaml` blueprint (New → Blueprint → pick this repo),
or create a Web Service manually with:

- **Build:** `pnpm install --frozen-lockfile && pnpm --filter @oinkbooks/api build && pnpm --filter @oinkbooks/api db:migrate`
- **Start:** `node apps/api/dist/main.js`
- **Health check path:** `/health`
- **Env vars:**
  - `DATABASE_URL` = the Neon pooled string from step 1
  - `JWT_SECRET` = a long random string (Render can generate it)
  - `JWT_EXPIRES_IN` = `7d`
  - `WEB_ORIGIN` = your Vercel URL from step 3 (set after first Vercel deploy)
  - `NODE_ENV` = `production`

Render injects `PORT`; the API reads it and binds `0.0.0.0`. Note the service
URL, e.g. `https://oinkbooks-api.onrender.com`.

## 3. Vercel (Angular)

1. Import the repo. Set **Root Directory = repo root** (so the pnpm workspace
   installs `@oinkbooks/types`). `vercel.json` supplies build/output/rewrites.
2. Before deploying, set the API URL in `apps/web/src/environments/environment.prod.ts`
   (`apiUrl`) to your Render URL from step 2, commit, and deploy.
3. Copy the resulting Vercel URL back into Render's `WEB_ORIGIN` env var (for CORS)
   and redeploy the API.

## 4. Smoke test (deployed)

```bash
API=https://oinkbooks-api.onrender.com   # your Render URL
# (free tier: first call may take ~30–60s while the service wakes)
curl -s $API/health
curl -s -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","username":"you","password":"your-password-here"}'
```

Then open the Vercel URL, register/login, and confirm the dashboard loads.

## Config knobs (no hardcoded localhost)

- API origin/port/secret/DB all come from env vars (`apps/api/src/main.ts`,
  `db.module.ts`, `auth.module.ts`).
- Frontend API URL is swapped at build time via `angular.json`
  `fileReplacements` (dev `environment.ts` → `environment.prod.ts`).
