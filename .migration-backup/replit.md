# LoopSpace

A lightweight SaaS workspace for early-stage founders to collect, organize, and prioritize beta feedback. Know exactly what to fix next.

## Run & Operate

- `pnpm --filter @workspace/loopspace run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned by Replit Clerk integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, shadcn/ui, Wouter, TanStack Query
- Auth: Replit-managed Clerk (`@clerk/react` + `@clerk/express`)
- API: Express 5 with Clerk middleware + proxy
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod v3, drizzle-zod
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, projects, pages, feedback)
- `artifacts/api-server/src/routes/` — Express route handlers (users, projects, pages, feedback, dashboard)
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk auth proxy
- `artifacts/loopspace/src/` — React frontend (pages, components, hooks)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)

## Architecture decisions

- All integer fields in OpenAPI spec use `type: number` (not `type: integer`) — Orval 8.23 generates `zod.int()` for integers which is Zod v4-only; the catalog pins Zod v3.
- Feedback submission (`POST /api/feedback`) is public (no auth) — uses `pageToken` (a random hex string) instead of a numeric page ID, so beta users can submit via iframe without any account.
- Local user rows are JIT-provisioned on first authenticated request using Clerk's `userId` claim — no webhook required.
- Clerk auth is cookie-based on web; `setAuthTokenGetter` is not used (mobile-only pattern).
- `tailwindcss({ optimize: false })` set in vite.config.ts to prevent Clerk CSS layer reordering in prod builds.

## Product

- **Projects** — founders create projects (e.g. "My App v1 Beta")
- **Pages** — each project has pages (e.g. "Onboarding", "Dashboard") with a unique iframe token
- **Feedback collection** — each page generates an embeddable iframe URL; beta users submit structured feedback with title, description, priority
- **Dashboard** — feedback grouped by page, status breakdown (Open / In Progress / Fixed / Ignored), recent activity feed
- **Status management** — founders can triage feedback inline, updating status per item

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run codegen before using updated types: `pnpm --filter @workspace/api-spec run codegen`
- After changing `lib/*` schema, run `pnpm run typecheck:libs` before checking artifacts — stale declarations cause false TS2305 errors
- `pnpm --filter @workspace/db run push` only for dev schema changes; production schema is managed by Replit's Publish flow
- The Clerk dev-keys warning in browser console is expected in development — not an error

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth customization and troubleshooting
