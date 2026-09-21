# Performance

> The catalog's own caching contract — what is cached per ref, what awaits
> `connection()`, why nothing is caught inside a cached scope — lives in
> [`architecture.md`](architecture.md). This page is the general mechanics.

Three mechanisms, each guarding a different way an app gets slow.

## 1. Cache Components — the static shell

`cacheComponents: true` prerenders a static shell for every route and streams
request-time data into it. Two rules make it work, and breaking either one
silently reverts a route to "blank until the server finishes":

**A page's default export is synchronous.** It returns a `<Suspense>`; the
async child does the request-time reads.

```tsx
// ✅ the shell prerenders; data streams in
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Loader />
    </Suspense>
  )
}

async function Loader() {
  await connection() // a list read: the build stops here, never at Convex
  const companies = await loadCompanies()
  return <CompanyGrid companies={companies} />
}

// ❌ nothing prerenders — the whole route waits
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  …
}
```

Any of `auth()`, `cookies()`, `headers()`, `params`, `searchParams` or a data
read at the top of an async page has this effect. `next dev` flags it as a
blocking route (`experimental.instantInsights`), which is why that setting is
pinned rather than left to the framework default.

**Never `export const dynamic = 'force-dynamic'`.** It opts the route out
wholesale. Reach for `Cache-Control: no-store` on the response, or the Next 16
cache model.

**Fallbacks must be dimensionally stable** — the same box as the real content.
A fallback that is shorter makes the page land and then jump, which measures as
layout shift and feels like a bug.

## 2. Instant Navigations — the prefetch

`partialPrefetching: true` makes `<Link>` prefetch one reusable App Shell per
route rather than a full payload per visible link. On a page with twenty links
that is one request instead of twenty.

Per-link `prefetch={true}` still opts a specific destination into
URL-specific prefetch — use it for the one link you know they will click.

## 3. The bundle budget — the ratchet

Nobody adds 400 KB to a route. People add 8 KB, twelve times, over a quarter,
each obviously fine in its own diff. The budget makes the twelfth one visible
in the pull request that causes it, which is the only moment anyone can cheaply
choose differently.

```bash
pnpm build && pnpm perf:bundle            # the CI gate
pnpm build && pnpm perf:bundle:snapshot   # re-baseline, on a green build
```

Policy: growth of 5% or 15 KB, **whichever is smaller**. A real feature clears
it; a stray import of a charting library does not.

Re-baselining is deliberate, and the diff is reviewed. A budget you can
silently regenerate is not a budget.

When a route fails, in order of preference: delete the import, `next/dynamic`
the component that is only used after an interaction, move the work to the
server, or — having decided the weight is worth it — re-baseline and say so in
the PR.

## Turbopack

`turbopack: {}` in `next.config.ts` is how you acknowledge the bundler; it is
also what `experimental.turbopackRustReactCompiler` requires. The React
Compiler then runs in Rust inside Turbopack, with no Babel in the pipeline.

`serverComponentsHmrCache: false` is a dev-only trade: the RSC fetch cache does
not survive Fast Refresh, which costs a re-fetch of `fetch()` data per refresh
and buys several hundred MB of peak dev memory and roughly half the HMR
latency. An app whose reads go through the Convex client barely pays the cost.

In CI, `.next/cache` is restored from a key built on the Next version plus the
lockfile, with the commit SHA last — so every run saves a fresh entry and the
next run restores the closest one. An older cache is a valid warm start, never
a wrong one.

## Convex reads

- Index everything you filter or sort on. `.filter(...)` is a table scan
  wearing a predicate; `.withIndex(...)` is the query.
- `.take(n)`, never `.collect()`. The table that is small today is the 16 MB
  read limit that takes the page down next year.
- `Promise.all` independent reads. Two sequential awaits on unrelated data is
  two round trips for no reason.
- Join by point reads: `getMany` in `convex/shared/reads.ts` loads a set of
  ids in one parallel round; an `await` inside a loop is a Biome error here.
- Suspense the leaf, not the page: start the promise early, suspend only the
  component that needs the result.
