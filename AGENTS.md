# Agent guidelines — growth.engineer

Read [development conventions](docs/maintainers/development.md) for the full
invariants and [validation](docs/maintainers/validation.md) for local workflow.
Keep this root guide below 200 lines and 8 KiB.

## Sources and ownership

This is the open-source catalog of companies, tools and workflows. The catalog
is the repository: `companies/`, `workflows/` and `tags.yml`. Reads are public.
Every tool is one function tied to an MCP tool, CLI command or API endpoint;
every workflow is a sequence of tools. Do not invent facts or commands.

Catalog edits touch source files, never rendered output. Start at
[CONTRIBUTING.md](CONTRIBUTING.md), the [company format](companies/README.md),
and the [workflow format](workflows/README.md). Local skills:
[add-workflow](.agents/skills/add-workflow/SKILL.md) and
[research-company](.agents/skills/research-company/SKILL.md).

## Critical boundaries

- `lib/content/read-tree.ts` owns tree reads; `buildCatalog(files)` is pure.
  Strict schemas report all invalid content paths. Test negative cases before
  implementing new validation rules.
- One render path: `lib/catalog/render-markdown.ts` and `render-tag.ts`, called
  at build time by `lib/content/build-documents.ts`. Rendered documents are
  never hand-edited. Change format and golden fixtures together.
- Public keys are paths and remain stable. Renames use aliases and real 308
  redirects. Draft tools/workflows have no public page, file or list.
- The pure catalog layer imports no Node, `server-only` or content reader code.
  Definitions, derived fields, relations and SEO metadata each have one owner.
- Pages prerender known keys. Do not add `dynamic`, `revalidate`, `dynamicParams`
  or request-time catalog rendering. Copy-count holes are the caching exception.
  Read the development guide before changing proxy, redirects or MCP routes.
- Internal page navigation uses `next/link`. File endpoints and external URLs
  use ordinary anchors. Search/filter state lives in links and GET forms.
- The catalog has no backend database or auth provider. Optional Redis counts
  copies; the newsletter calls Brew from the server. Environment access goes
  through `lib/env.ts`; secrets never reach browsers or logs.

## Validation

- Batch `pnpm exec biome check --write <touched files>` once per coherent edit.
- Changed behavior: `pnpm test:run tests/<exact file>`. Prove regression tests
  fail before implementing pure-function changes. Renderer edits require the
  markdown golden tests.
- Catalog changes: `pnpm content:check`. Docs: `pnpm docs:check`.
- Code changes use the owning `pnpm check`/`pnpm tsc` and `pnpm lint` according
  to the detailed validation guide. CI owns full build and hygiene checks.
- Heavy checks queue through `scripts/heavy-lock.mjs`; never bypass it with
  bare Vitest, TypeScript, Next builds, knip or raw scripts. Use `pnpm dev` for
  servers; preserve other sessions and active caches.

Use Tailwind `flex gap-*`, shared typography roles and Hugeicons. Preserve the
existing module, naming and file-size conventions. Keep security/compatibility
explanations; remove obsolete narration and duplicate configuration comments.
Update the closest documentation when moving a boundary.

## References

[Data model](docs/data-model.md), [markdown contract](docs/markdown-files.md),
[architecture](docs/architecture.md), [setup](docs/setup.md),
[CI](docs/maintainers/ci.md), [performance](docs/maintainers/performance.md),
and [logos](docs/maintainers/logos.md).
