# First run

About two minutes. There is no backend, no database and no auth provider:
the catalog is built from the markdown files in this repository, every page
and file is public, and nobody signs in.

## 1. Clone and install

```bash
pnpm install
```

`.env.example` lists the only two variables, both optional and both public:
`NEXT_PUBLIC_SITE_URL` (the absolute origin `/llms.txt` prints) and
`NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID` (logos.context.dev; absent means the
local marks under `public/logos/` are used). Copy it to `.env.local` only if
you need to change one.

## 2. Run it

```bash
pnpm dev                 # http://localhost:3000
```

The catalog is read from `companies/`, `workflows/` and `tags/` when the
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

Edit the file under `companies/`, `workflows/` or `tags/` — never a rendered
file, never the app. [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the folder
READMEs have the field reference and templates.

## Deploying to Vercel

- **Build command** is `pnpm build:raw` (via `vercel.json`); `next build`
  renders every catalog page and every `.md` file at build time. A deploy IS
  the publish — there is nothing to seed, migrate or revalidate.
- **Environment variables**: `NEXT_PUBLIC_SITE_URL` set to the deployment's
  origin, and optionally the logo client id. Nothing secret.
- **Preview deployments** need nothing extra: each builds its branch's tree.
- **Function bundles**: the routes that read `searchParams` (`/tools`,
  `/companies`, `/workflows`, `/map`) read the tree at request time, so
  `next.config.ts` traces `companies/`, `workflows/` and `tags/` into every
  serverless bundle (`outputFileTracingIncludes`).
