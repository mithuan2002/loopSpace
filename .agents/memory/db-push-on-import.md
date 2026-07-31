---
name: DB schema push required on fresh import
description: When a Replit pnpm workspace project is imported/re-imported, the Postgres database is fresh and has no tables — Drizzle schema must be pushed before the API can serve requests.
---

# DB schema push required on fresh import

## Rule
After importing a pnpm workspace project that uses Drizzle + Postgres, always run:

```sh
pnpm --filter @workspace/db run push
```

before testing API routes. The database is provisioned fresh on import; no tables exist until the schema is pushed.

**Why:** Replit provisions a new Postgres instance on import. The Drizzle schema lives in `lib/db/src/schema/` and must be applied via `drizzle-kit push` before the API can query any tables. Symptoms: `relation "users" does not exist` errors in the API server log immediately after sign-in.

**How to apply:** Run this once after any fresh import or environment reset. Not needed after normal code changes (only schema changes need a re-push).
