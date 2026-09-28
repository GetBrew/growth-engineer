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
metadata print, and the copy counter's `KV_REST_API_URL` /
`KV_REST_API_TOKEN`. Copy it to `.env.local` only if you need one.

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
- **The copy counter** (a workflow's "Uses"): add Upstash for Redis from the
  Vercel Marketplace to the project; it sets `KV_REST_API_URL` and
  `KV_REST_API_TOKEN`, the one secret (`UPSTASH_REDIS_REST_*` works too).
  The count is prerendered with each workflow page and refreshed in the
  background every five minutes (`lib/usage/copies.ts`); each Copy is one
  `HINCRBY` on the hash `workflow:copies`. Without the store the count is
  hidden and nothing else changes.
- **Preview deployments** need nothing extra: each builds its branch's tree.
- **Function bundles**: every page prerenders; only an unknown key on a
  detail route and the `/mcp` endpoint read the tree at request time, so
  `next.config.ts` traces `companies/`, `workflows/` and `tags.yml` into every
  serverless bundle (`outputFileTracingIncludes`).
