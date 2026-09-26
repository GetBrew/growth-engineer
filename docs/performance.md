# Performance

> What prerenders and why — the catalog built once per process from sync
> reads, `generateStaticParams` on every detail route, listings that narrow
> in the browser — lives in [`architecture.md`](architecture.md). This page
> is the general mechanics.

Three mechanisms, each guarding a different way an app gets slow.

## 1. Cache Components — everything prerendered, nothing loads

`cacheComponents: true` prerenders every route. This site has no
request-time data at all — the catalog is in memory — so every page's HTML is
complete at build and nothing on it loads: no skeletons, no spinners, no
fetch after the page arrives. Two rules keep it that way.

**A page without params renders its data directly.** Its async children read
the in-memory catalog, which resolves during the prerender. There is no
Suspense and no fallback to design — and if a request-time read ever sneaks
in, the build fails instead of the page quietly growing a loading state.

**A page with params is synchronous and awaits them in a Suspense child.**
Every known key is listed by `generateStaticParams` and prerenders complete;
only an unknown key (answered on demand with a 404 or an alias's 308) reaches
the boundary, so its fallback is `null`.

```tsx
// ✅ every known key prerenders complete; nothing is drawn while it resolves
export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={null}>
      <Detail params={params} />
    </Suspense>
  )
}

// ❌ awaiting params in the page itself blocks the route from prerendering
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  …
}
```

`next dev` flags a blocking route (`experimental.instantInsights`), which is
why that setting is pinned rather than left to the framework default.

**Never `export const dynamic`, `revalidate` or `dynamicParams`.** Cache
Components rejects them at build.

**A client component that reads the URL** (`useSearchParams`) suspends the
prerender, so its fallback is the same component with no query — the
listings do this, and their static HTML holds every row.

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
or `●` for every page, `◐` for the listings (a static shell that already
holds every row) and for the on-demand fallbacks of unknown keys, and `ƒ`
only for `/mcp`.

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
