# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CRC Platform — the ASYV Career Resources Center app: a Next.js 16 (App Router, React 18) + TypeScript application backed by Supabase (Postgres + Auth) with Prisma as the ORM. It serves students (dashboard, workshops, essays, opportunities) and admins (content/student/attendance management).

> Note: `README.md` is partly aspirational/stale — it predates the tRPC migration, still references a Sanity CMS migration and REST `/api/*` endpoints, and lists an older Next.js version. Trust the code and this file over the README for architecture.

## Commands

```bash
npm run dev            # Start dev server (localhost:3000)
npm run build          # prisma generate && next build  (build fails if Prisma client is stale)
npm start              # Serve the production build
npm run lint           # ESLint (eslint-config-next)
npx tsc --noEmit       # Type-check; there is no test runner in this repo
npx prisma generate    # Regenerate Prisma client after editing schema.prisma
npx prisma studio      # Inspect the database
```

There is **no unit/integration test framework** — "testing" here means `npm run lint` + `npx tsc --noEmit`. (`src/app/testing/` is a scratch/demo playground, not a test suite.)

`postinstall` runs `prisma generate && patch-package`, so `npm install` applies patches in `patches/` — don't hand-edit `node_modules`.

## Architecture

### tRPC is the API layer (not REST)
All application data flows through **tRPC v11**, not REST routes. The only real HTTP routes are `src/app/api/trpc/[trpc]/route.ts` (the tRPC handler), `api/auth/callback`, and `api/admin/crc-classes/bulk-import`.

- Routers live in `src/trpc/routers/*` and are composed in `src/trpc/routers/_app.ts` (`appRouter`). Add a new feature by creating a router file and registering it there.
- `src/trpc/init.ts` defines the context and the procedure tiers. Use the right tier — it *is* the authorization:
  - `baseProcedure` — public / unauthenticated (used for public resources).
  - `protectedProcedure` — any signed-in user.
  - `adminProcedure` — requires `role === 'admin'` (throws `FORBIDDEN` otherwise).
  - `studentProcedure` — requires `role === 'student'`.
- Client usage: `useTRPC()` from `src/trpc/client.tsx` (wrapped by `TRPCReactProvider`), paired with TanStack Query. Server components use `src/trpc/server.tsx`. superjson is the transformer, so `BigInt`/`Date` serialize across the wire.

### Auth & role resolution
Supabase Auth is the identity provider. The tRPC context (`init.ts`) takes the Supabase user and looks it up in Prisma: an `admin` row → `role: 'admin'`, a `students` row → `role: 'student'`, otherwise `null`. **A Supabase user is not automatically an app user** until it has a matching `admin` or `students` record.

Route protection is enforced twice:
1. **Middleware** (`middleware.ts` → `src/utils/supabase/middleware.ts`) guards `/dashboard/admin` and `/dashboard/student`, redirects unauthenticated users to `/login`, sends students without `profiles.has_setup` to `/setup`, and treats `SUPER_ADMIN_USER_ID` as an admin bypass. It queries Supabase directly (service role), not Prisma.
2. **tRPC procedures** re-check the role on every call. Both layers matter — middleware gates pages, procedures gate data.

The user identity is spread across three tables: `admin`, `students`, and `profiles` (holds `has_setup`, `role` enum). Keep these consistent when creating/deleting users.

### Database (Prisma + Supabase, multi-schema)
`prisma/schema.prisma` uses `multiSchema` over the `auth` and `public` Postgres schemas.
- **Do not modify the `auth`-schema models** (`users`, `sessions`, `identities`, `mfa_*`, `refresh_tokens`, etc.) — they mirror Supabase's managed internal auth tables.
- Domain models are in the `public` schema: `admin`, `students`, `profiles`, `workshops`, `assignments`, `submissions`, `essay_requests`/`essay_referrals`, `opportunities`/`opportunity_referrals`, `attendance_sessions`/`attendance_records`, `crc_class`, `announcements`, `resources`.
- IDs are `BigInt` — expect `bigint` in TS and string-cast at UI boundaries (routers often do `BigInt(input.id)`).

### Supabase client flavors
Pick the right one; they differ in privileges:
- `src/utils/supabase/client.ts` — browser client (anon key), respects RLS.
- `src/utils/supabase/server.ts` — server/RSC client (cookie-based session).
- `src/utils/supabase/service-role.ts` and `src/lib/supabase-admin.js` — **service role, bypasses RLS**. Server-only; never import into client components.

Routers commonly mix Prisma (relational reads/writes) with `supabaseAdmin` (auth admin ops, storage). Prisma is the source of truth for relational data.

### Supabase Edge Functions (Deno)
`supabase/functions/*` are Deno serverless functions, mostly transactional email + AI document scanning (`send_*`, `scan_report_card_ai`, `extract_names_ai`). Deploy with `supabase functions deploy <name>`. These are a separate runtime — don't import app `src/` code into them.

### Routing layout (App Router route groups)
- `src/app/(site)` — public marketing site + resources.
- `src/app/(auth)` — login / register / create-admin.
- `src/app/(dashboard)/dashboard/{admin,student}` — authenticated app.
- `src/app/setup` — student first-run onboarding (gated by `profiles.has_setup`).

## Conventions

- **Path aliases:** `@/*` → `src/*`, and `@/zenith/*` → `zenith/src/*`. The `zenith/` tree is a secondary UI source referenced via that alias.
- **UI:** shadcn/Radix primitives in `src/components/ui`, styled with Tailwind (`components.json` drives shadcn). Forms use react-hook-form + Zod; Zod schemas are typically defined at the top of the relevant router and reused for input validation.
- **Build config:** `next.config.js` sets `output: 'standalone'` (for the Docker/Vercel deploy) and wraps the app with Sentry (`withSentryConfig`). `instrumentation*.ts` and `sentry.*.config.ts` wire up monitoring.
- **When editing `schema.prisma`,** run `npx prisma generate` before building — `next build` runs it too, but the dev server uses the already-generated client.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
