# First run

About ten minutes. Convex is required; Clerk is optional until you need the
signed-in surface.

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

`auth.config.ts` reads `CLERK_JWT_ISSUER_DOMAIN` from the deployment and the
CLI insists it exists. Until Clerk is set up, set it EMPTY — the provider
list is then empty, human auth is off, and every public read works:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN ""
```

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

## 6. Clerk (when you need sign-in)

Create an application at clerk.com and put the keys in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
CLERK_SECRET_KEY=sk_test_…
```

**The JWT template — do not skip this.** Clerk → JWT Templates → New
template, named exactly `convex`:

```json
{ "aud": "convex", "orgId": "{{org.id}}", "orgRole": "{{org.role}}" }
```

Authorization claims only; display data (name, email, avatar) comes from the
`users` mirror the webhook writes. Then tell Convex which issuer to trust —
your Clerk frontend API URL (base64-decode the publishable key after its
prefix and drop the trailing `$`):

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your>.clerk.accounts.dev
```

Without it, `ctx.auth.getUserIdentity()` is null forever and every guarded
function refuses, silently. Optional: a Clerk webhook at
`/api/webhooks/clerk` (`user.created|updated|deleted`) with its signing
secret in `CLERK_WEBHOOK_SECRET` keeps the `users` mirror current.

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
