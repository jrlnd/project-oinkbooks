# OinkBooks v2

A personal purchase tracker — visualise and track expenses on a calendar, table, and chart.

**v2** is a ground-up rebuild of the [v1 app](https://github.com/) (Next.js + React + Firebase + Material UI)
onto an Angular stack, ported incrementally one feature slice at a time.

## Stack

| Layer | v1 (React) | v2 (Angular) |
| --- | --- | --- |
| Frontend | Next.js 12 + React 17 | **Angular 21** + Angular Material |
| Reactivity | hooks (`useState`/`useEffect`) | **RxJS** data layer + signals for UI state |
| Backend | Firebase (BaaS) | **NestJS** REST API |
| Database | Firestore | **Postgres** + Drizzle ORM |
| Auth | Firebase Auth | **JWT + bcrypt** (owned) |
| Charts | Recharts | ngx-charts |
| Forms | react-hook-form | Angular Reactive Forms |

## Repository layout (pnpm workspace monorepo)

```
oinkbooks/
├─ apps/web/          Angular frontend (Angular Material, RxJS)
├─ apps/api/          NestJS API (Drizzle + Postgres, JWT auth)
├─ packages/types/    Shared domain types (used by web AND api)
├─ docker-compose.yml local Postgres
└─ pnpm-workspace.yaml
```

`packages/types` is the single source of truth for `PurchaseDetails`, `CategoryDetails`,
and the request/response DTOs — imported by both the frontend and the backend so the
contract can never drift.

## Getting started

```bash
pnpm install            # install all workspace deps
cp .env.example .env     # configure DB + JWT secret
pnpm db:up               # start Postgres (Docker)
pnpm db:migrate          # apply Drizzle migrations   (added in the schema slice)
pnpm dev                 # run web (:4200) + api (:3000) together
```

Or run individually: `pnpm dev:web` / `pnpm dev:api`.

## React → Angular notes

The port preserves v1's feature set while translating idioms:

- `useState` → signals · `useMemo` → `computed()` · `useEffect` → `effect()`
- React Context (`UserContext`) → an injectable `root` service
- `PrivateRoute` → a `CanActivate` route guard
- Firestore `onSnapshot` listeners → RxJS streams (`switchMap` over the date range),
  with refetch-on-mutation in place of live snapshots
- MUI components → Angular Material; the hand-rolled CSS-Grid calendar ports nearly verbatim
