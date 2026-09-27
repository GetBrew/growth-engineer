# Adding a second app

> For growth.engineer a second app is hypothetical: the catalog is a tree of
> files and a static site, and contributions arrive as pull requests. If a
> review or curation surface ever needs its own deploy schedule, this is the
> case below.

Most apps never need this. Read the first section before you decide you do.

## When it is worth it

A second Vercel project — an admin surface, a docs site, a marketing site — is
worth it when a team wants to **deploy on its own schedule** without waiting on
your build and your test suite, or when a surface has genuinely different
performance and security characteristics (an internal admin app has no reason
to be prerendered, cached, or fast for anonymous traffic).

It is NOT worth it to organize code. A route group and a directory do that, for
free, with one deployment to reason about.

## The choice that is painful to reverse

**A path mount** (`example.com/admin/*`) keeps one origin: cookies, sessions
and `fetch` credentials all just work, and the parent project proxies matching
paths to the child. The cost is coupling — the parent's proxy, its route
matcher and its asset prefixing all have to know the child exists.

**Its own subdomain** (`admin.example.com`) is independent in every way, and
the cost is that it is a different origin: you now own a cookie-domain and CORS
story, and the auth provider — once there is one — has to be configured for both.

Pick deliberately. Moving from one to the other later means a redirect layer
for every URL anyone bookmarked.

## Path-mounted, concretely

1. **Scaffold** the app under `apps/admin/` with its own `package.json`. The
   `pnpm-workspace.yaml` globs already include `apps/*`.

2. **Install** the router in the ROOT app:

   ```bash
   pnpm add @vercel/microfrontends
   ```

3. **Declare** both applications in `microfrontends.json` at the repo root —
   the default application is the root app; the child declares the paths it
   owns:

   ```json
   {
     "$schema": "https://openapi.vercel.sh/microfrontends.json",
     "applications": {
       "growth-engineer": { "packageName": "growth-engineer" },
       "growth-engineer-admin": {
         "packageName": "@app/admin",
         "routing": [{ "group": "admin", "paths": ["/admin", "/admin/:path*"] }]
       }
     }
   }
   ```

4. **Wrap** the root `next.config.ts`. Order matters when several wrappers are
   involved: `withMicrofrontends(config)` returns a `NextConfig`, so anything
   that returns a phase-aware FACTORY must wrap it last, not first.

   ```ts
   import { withMicrofrontends } from '@vercel/microfrontends/next/config'
   export default withMicrofrontends(nextConfig)
   ```

5. **Exclude the child's paths from the parent proxy matcher** in `proxy.ts`.
   The child runs its own proxy; running the parent's as well means every admin
   request pays for two proxies, and the two drift:

   ```
   '/((?!_next|admin(?:/|$)|[^?]*\\.(?:…)).*)'
   ```

6. **Prefetch across zones** with `<PrefetchCrossZoneLinks />` from
   `@vercel/microfrontends/next/client` in the root layout — a cross-zone link
   is a full page load unless something warms it.

## What each app owns

- **Its own `next.config.ts`, `tsconfig.json` and `proxy.ts`.** A child that
  reaches into the parent through a relative path or a shared `@/*` alias is
  not independently deployable — that is the whole property you are buying.
- **Shared code goes in `packages/*`**, imported by a workspace alias that both
  apps declare in their own path map. The pure half of `lib/catalog/*` is the
  first candidate: both apps can bundle the key grammar and the renderer, and
  `lib/content/` can build the same catalog from the same tree.

## The invariants to keep

- The parent's proxy matcher excludes every child path prefix. Test it.
- A surface's authority never comes from "it is only reachable at this URL".
  A URL is not an authorization boundary.
- Each app's client bundle gets its own budget snapshot.
