# First run

About five minutes. Convex is the only requirement — there is no auth
provider, so every page, file and search is public and nobody signs in.

## 1. Clone and install

```bash
pnpm install
cp .env.example .env.local
```

## 2. Convex

```bash
npx convex dev
```

The first run creates a project and writes `CONVEX_DEPLOYMENT` and
`NEXT_PUBLIC_CONVEX_URL` into `.env.local`; it pushes the schema and
functions, regenerates `convex/_generated`, and watches `convex/`.

**Headless (agents, CI):** a `dev:` deploy key in `.env.local` as
`CONVEX_DEPLOY_KEY` lets `npx convex dev --once`, `convex run` and `convex env`
work without a login. Never commit one.

## 3. The service token

The token that proves a Convex call (and a cache purge) came from our own
server. Both sides must match; it is never a person's authority.

```bash
openssl rand -hex 32                                   # → CONVEX_SERVICE_TOKEN in .env.local
npx convex env set CONVEX_SERVICE_TOKEN <the same value>
```

## 4. Seed

```bash
pnpm seed          # 25 companies, 25 tools, 12 workflows, 59 tags, 62 files
pnpm seed          # again: every file "unchanged" — the seed is idempotent
```

The catalog is illustrative: real vendors and public endpoints, taglines ours,
nothing verified by a person — which is why every tool is `agent: unverified`.
`pnpm seed:reset` removes it (bounded; repeat until `remaining` is 0). Edit
`convex/seed/*.ts` and run `pnpm seed` to apply.

## 5. Run it

```bash
pnpm dev
```

Then `pnpm validate` once, to see every gate green before changing anything.

## 6. Auth

There is none, on purpose. `convex/shared/builders.ts` still ships the
identity tiers (`authenticatedQuery`, `orgMemberQuery`, `orgAdminMutation`)
and they fail closed: with no provider configured,
`ctx.auth.getUserIdentity()` is always null and every guarded function
refuses. Adding a provider back is three things, in this order:

1. Its keys in `lib/env.ts` as REQUIRED — an optional provider key is a
   provider that is silently off in production.
2. A `convex/auth.config.ts` naming the issuer and the `convex` JWT template,
   whose claims must include `orgId` for the org tiers to authorize anyone.
3. The human transport in `lib/convex/gateway.ts` (`tenantQuery` /
   `tenantMutation`), which reads the session on the request and sends
   `actingUserId` alongside the service token. Convex already enforces the
   pairing — a service token that names nobody is refused.

The gate belongs in the page or route handler that owns the data, never in
`proxy.ts`: path matching there can diverge from how Next routes a request.

## 7. Logos

`NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID` (a public client id from
logos.context.dev) lets `lib/logos.ts` build logo URLs; absent, the local
marks under `public/logos/` are used. The seed uses local marks.

## Deploying to Vercel

- **Build command** is `bash scripts/vercel-build.sh` via `vercel.json`: it
  runs `convex deploy` around the Next build per environment. Production
  pushes functions only after the build succeeds, so a prerendered page must
  not hard-depend on a Convex function introduced in the same commit.
- **Environment variables**: everything in `.env.local` minus the deploy key,
  per environment, plus `NEXT_PUBLIC_SITE_URL` set to the deployment's origin
  (`/llms.txt` and the file index use it).
- **Preview deployments**: set `CONVEX_DEPLOY_KEY` to a **preview** deploy key
  (`preview:<team>:<project>|<secret>`) so every PR gets its own Convex
  backend; a `dev:`/`prod:` key would push the branch onto that shared
  deployment, which the build script refuses.
- **Cache purge**: after a file re-renders, `POST /api/revalidate` with
  `Authorization: Bearer <CONVEX_SERVICE_TOKEN>` and `{ "refs": [...] }`.
