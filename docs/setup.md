# First run

Roughly ten minutes, most of it in two dashboards. Do the steps in order — the
Clerk JWT template is the one people skip, and skipping it produces a working
app where every authenticated read silently returns nothing.

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
`NEXT_PUBLIC_CONVEX_URL` into `.env.local`. Leave it running — it watches
`convex/` and pushes on save.

## 3. Clerk

Create an application at [clerk.com](https://clerk.com), then copy the keys
into `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
CLERK_SECRET_KEY=sk_test_…
```

### The JWT template — do not skip this

Clerk → **JWT Templates** → **New template**. Name it exactly `convex`:

```json
{
  "aud": "convex",
  "orgId": "{{org.id}}",
  "orgRole": "{{org.role}}"
}
```

Then tell Convex which issuer to trust. The value is your Clerk FRONTEND API
URL — base64-decode your publishable key after the `pk_test_` / `pk_live_`
prefix and strip the trailing `$`:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your>.clerk.accounts.dev
```

**Why this matters.** `convex/auth.config.ts` reads that variable. Without it,
`ctx.auth.getUserIdentity()` returns `null` forever — even with a perfectly
valid session in the browser — and every guarded function refuses. Nothing is
logged. It is the single most common "auth is broken and I cannot see why" in
a Convex + Clerk app.

A template missing `orgId` fails the same way for org-scoped functions only:
they authorize nobody, quietly.

Keep the template to AUTHORIZATION claims. Display data (name, email, avatar)
belongs in the `users` mirror the Clerk webhook writes — a token every single
request carries is the wrong place for it.

## 4. The service token

The token that proves a Convex call came from our own server:

```bash
openssl rand -hex 32          # put the value in .env.local as CONVEX_SERVICE_TOKEN
npx convex env set CONVEX_SERVICE_TOKEN <the same value>
```

Both sides must match. It is never a person's authority — the acting user
rides alongside it (see [`architecture.md`](architecture.md)).

## 5. Run it

```bash
pnpm dev
```

Then `pnpm validate` once, to see every gate green before you start changing
things.

## 6. Optional: the Clerk webhook

To mirror Clerk users into Convex (`convex/users.ts`), add a webhook endpoint
in Clerk pointing at `https://<your-app>/api/webhooks/clerk`, subscribe to
`user.created`, `user.updated` and `user.deleted`, and put the signing secret
in `CLERK_WEBHOOK_SECRET`. Locally, forward it with a tunnel.

## Deploying to Vercel

- **Build command** is already `bash scripts/vercel-build.sh` via
  `vercel.json`. It runs `convex deploy` around the Next build, per environment.
- **Environment variables**: the four from `.env.local`, per environment.
- **Function duration** is a BUDGET, not a default to raise globally. When a
  route genuinely needs longer, give that ONE route a `maxDuration` under
  `functions` in `vercel.json` — so a hung dependency on every other route
  still fails fast instead of holding a function open for minutes.
- **Preview deployments**: set `CONVEX_DEPLOY_KEY` to a **preview** deploy key
  (`preview:<team>:<project>|<secret>`), generated at Convex → Project Settings
  → Deploy Keys. Every PR then gets its own isolated Convex backend.

  A `dev:` or `prod:` key here does NOT create a preview — it pushes the branch
  straight onto that existing deployment, so every PR build clobbers the
  backend every other preview is using. `scripts/vercel-build.sh` checks the
  key's shape and refuses rather than doing that.
