# Performance

> What prerenders and why — the catalog built once per process from sync
> reads, `generateStaticParams` on every detail route, only `searchParams`
> routes streaming — lives in [`architecture.md`](architecture.md). This
> page is the general mechanics.

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

async function Loader({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams // the one request-time read
  const companies = await loadCompanies(200, params.category)
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

**Never `export const dynamic`, `revalidate` or `dynamicParams`.** Cache
Components rejects them at build. A route that must not be static reads
request data in its Suspense child; everything else prerenders.

**Fallbacks must be dimensionally stable** — the same box as the real content.
A fallback that is shorter makes the page land and then jump, which measures as
layout shift and feels like a bug.

## 2. Instant Navigations — the prefetch

Every internal link is `next/link`, never a raw `<a href="/…">`. In
production a `<Link>` prefetches when it enters the viewport and again on
hover (`onMouseEnter`) or touch, and because every page here is prerendered
the prefetch IS the whole page — a click swaps in cached HTML/RSC with no
server work. `partialPrefetching: true` makes the viewport prefetch one
reusable App Shell per route rather than a full payload per visible link, so
twenty links cost one request.

Listings never read the URL on the server: they prerender every item and a
client component narrows the list from `useSearchParams`, so `/tools?has=mcp`
is the same static page as `/tools` with a different filter applied in the
browser. The map is one prerendered page per node. `pnpm build` prints `○`
for every route except the not-found and the on-demand fallbacks.

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
latency. An app whose reads come from an in-memory catalog never pays it.

In CI, `.next/cache` is restored from a key built on the Next version plus the
lockfile, with the commit SHA last — so every run saves a fresh entry and the
next run restores the closest one. An older cache is a valid warm start, never
a wrong one.

## Catalog reads

- The catalog is built ONCE per process and read from memory. A loader that
  reaches for the filesystem, the network or `Date.now()` turns the route it
  serves dynamic — silently, as a `◐` or `ƒ` in the build table.
- Keep the sync memo in `lib/catalog/catalog.ts` sync. `fs.promises` there
  would make every catalog page dynamic with no error.
- Suspense the leaf, not the page: the `searchParams` read is the only thing
  that belongs in an async child.
