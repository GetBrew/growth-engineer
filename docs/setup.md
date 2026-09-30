# First run

About two minutes. The catalog is built from the markdown files in this
repository: there is no database and no sign-in, and every page and file is
public. The one store is optional, a Redis that counts workflow copies, and
without it the counts are hidden.

## 1. Clone and install

You need Node 22+ and pnpm 11 (`corepack enable` installs the pinned pnpm).

```bash
pnpm install
```

Every environment variable is optional, so there is nothing to configure.
[`.env.example`](../.env.example) lists them; copy it to `.env.local` only if
you need one.

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The absolute origin printed in `/llms.txt`, the MCP card and page metadata. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN` | The copy counter's store. Development counts under its own keys. |
| `GITHUB_TOKEN` | Raises the GitHub API limit for the header's star count. It needs no scopes. |
| `NOTRA_GEO_TOKEN` | Notra's ingest token for AI-traffic analytics. Leave it unset locally. |

## 2. Run it

```bash
pnpm dev                 # http://localhost:3000
```

The catalog is read from `companies/`, `workflows/` and `tags.yml` when the
first page renders. In development it is read again whenever a content file
changes, so an edit shows on the next refresh. Content files are not modules,
so there is no hot reload.

## 3. Check the catalog

```bash
pnpm content:check       # parses, validates, resolves and renders every file
```

It lists every problem at once, each with its file path. The same suite runs
in `pnpm test:run` and in CI on every pull request.

Run `pnpm validate` once to see every gate pass before you change anything.

## 4. Change a fact

Edit the file under `companies/` or `workflows/`, or `tags.yml`. A fact never
changes in a rendered file or in the app. [`CONTRIBUTING.md`](../CONTRIBUTING.md)
and the folder READMEs have the field reference and templates.

## Deploying to Vercel

- **Build.** The build command is `pnpm build:raw` (set in `vercel.json`).
  `next build` renders every catalog page and every `.md` file, so a deploy
  publishes the catalog. There is nothing to seed, migrate or revalidate.
- **Environment variables.** None are required. `/llms.txt` and
  `metadataBase` use `NEXT_PUBLIC_SITE_URL` when it is set (a custom domain),
  and the deployment's own Vercel hostname otherwise.
- **Star count.** The header shows the repository's GitHub stars, fetched
  once per build by `next.config.ts` and inlined into the bundles
  (`lib/github-stars.ts`), so every render prints the same number until the
  next deploy refreshes it. Without
  `GITHUB_TOKEN` the build asks the GitHub API unauthenticated, which allows
  60 requests an hour per address, and a build machine may share its address.
  When GitHub does not answer within two seconds, the button shows without a
  count and the build carries on.
- **Copy counter.** A workflow's "Uses" and the Popular order need
  Upstash for Redis, added to the project from the Vercel Marketplace. It sets
  `KV_REST_API_URL`, `KV_REST_API_TOKEN` (the write secret, used only by the
  count route) and `KV_REST_API_READ_ONLY_TOKEN` (what pages read with).
  `KV_URL` and `REDIS_URL` are unused.
  - A copy counts once per visitor per workflow per 24 hours. The visitor is
    a keyed hash of the address (an IPv6 client by its /64), claimed with
    `SET NX`; the address itself is never stored.
  - A counted copy adds one to the hash `workflow:copies` and to that UTC
    day's `workflow:copies:<date>`, kept 60 days. "This week" is the last
    7 days.
  - Pages read every count in one round trip, at most once a minute, and
    stream them into `<Suspense>` holes; the rest of each page is
    prerendered (`lib/usage/copies.ts`).
  - A preview counts under `preview:…` and development under
    `development:…`, so testing never moves production's numbers.
  - Without a store every count is hidden and the pages are fully static.
- **Web Analytics and Speed Insights.** Turn both on in the Vercel project
  (the Analytics and Speed Insights tabs), then deploy. The root layout loads
  their scripts from `/_vercel/…`, which only a Vercel deployment with them
  turned on serves; locally and before that, the scripts 404 and nothing is
  counted.
- **AI-traffic analytics.** Set `NOTRA_GEO_TOKEN` for Production only, so
  previews and local runs send nothing. The proxy then reports each page
  view, file and `/llms.txt` fetch to Notra after the response, and Notra
  keeps AI crawlers and visits referred by an AI assistant.
- **Agent feedback.** The MCP server's `submit_feedback` tool posts to the
  Notra feedback URL in `lib/mcp/feedback-tool.ts`. It needs no token. A fork
  should point it at its own inbox.
- **Preview deployments** need nothing extra: each builds its branch's tree.
- **Function bundles.** Every page prerenders. Only an unknown key on a
  detail route and the `/mcp` endpoint read the tree at request time, so
  `next.config.ts` traces `companies/`, `workflows/` and `tags.yml` into every
  serverless bundle (`outputFileTracingIncludes`).
