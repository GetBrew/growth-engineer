# First run

About two minutes. There is no backend, no database and no auth provider:
the catalog is built from the markdown files in this repository, every page
and file is public, and nobody signs in. The one store is optional — the
Redis that counts workflow copies — and without it the count is hidden.

## 1. Clone and install

```bash
pnpm install
```

`.env.example` lists every variable, all optional:
`NEXT_PUBLIC_SITE_URL`, the absolute origin `/llms.txt`, the MCP card and the
metadata print, and the copy counter's `KV_REST_API_*`. Copy it to
`.env.local` only if you need one; development counts under its own keys.

## 2. Run it

```bash
pnpm dev                 # http://localhost:3000
```

The catalog is read from `companies/`, `workflows/` and `tags.yml` when the
first page renders. In development it is re-read whenever a content file
changes, so an edit shows on the next refresh (content files are not modules,
so there is no hot reload).

## 3. Check the catalog

```bash
pnpm content:check       # parses, validates, resolves and renders every file
```

Every problem is listed at once with its file path. The same suite runs as
part of `pnpm test:run` and in CI on every pull request.

Then `pnpm validate` once, to see every gate green before changing anything.

## 4. Change a fact

Edit the file under `companies/` or `workflows/`, or `tags.yml` — never a rendered
file, never the app. [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the folder
READMEs have the field reference and templates.

## Deploying to Vercel

- **Build command** is `pnpm build:raw` (via `vercel.json`); `next build`
  renders every catalog page and every `.md` file at build time. A deploy IS
  the publish — there is nothing to seed, migrate or revalidate.
- **Environment variables**: none required. `/llms.txt` and `metadataBase`
  use `NEXT_PUBLIC_SITE_URL` when set (a custom domain), otherwise the
  deployment's own Vercel hostname.
- **The copy counter** (a workflow's "Uses", and the Hot and Popular
  angles): add Upstash for Redis from the Vercel Marketplace to the project.
  It sets `KV_REST_API_URL`, `KV_REST_API_TOKEN` (the one secret; only the
  count route writes with it) and `KV_REST_API_READ_ONLY_TOKEN` (what pages
  read with). `KV_URL` and `REDIS_URL` are unused. Each Copy adds one to the
  hash `workflow:copies` and to that UTC day's `workflow:copies:<date>`
  (kept 60 days); Hot is the last 7 days. Pages read every count in one
  round trip at most once a minute and stream them into `<Suspense>` holes;
  the rest of each page is prerendered (`lib/usage/copies.ts`). A preview
  counts under `preview:…` and development under `development:…`, so testing
  never moves production's numbers. Without a store every count is hidden
  and the pages are fully static.
- **Preview deployments** need nothing extra: each builds its branch's tree.
- **Function bundles**: every page prerenders; only an unknown key on a
  detail route and the `/mcp` endpoint read the tree at request time, so
  `next.config.ts` traces `companies/`, `workflows/` and `tags.yml` into every
  serverless bundle (`outputFileTracingIncludes`).
