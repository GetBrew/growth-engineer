## What this changes

<!-- One company, workflow or fix per pull request. Name the keys it touches: `apollo`, `apollo/enrich-person`, `funding-signal-outbound`. -->

## How you checked it

<!-- Catalog: link the vendor's docs for every way in and every call. For a workflow, say what result it reaches and whether you ran it or read it as an agent would. Site code: what you ran, and a screenshot for anything visual. -->

## Checklist

Catalog changes:

- [ ] `pnpm content:check` passes (it lists every problem with its file and line).
- [ ] Nothing invented: every call, URL and fact is on a page the vendor publishes.
- [ ] Keys are new, or a rename lists the old key under `aliases`.
- [ ] A new tool names a capability from `tags.yml` (added there if none fit), and its `notes` say what to know before calling it.
- [ ] A workflow names one `motion` and opens with a `## Outcome` of what the user has at the end, never a promised result.
- [ ] Each workflow step says what to keep for later steps, and every value a call needs is kept or is an input.

Site changes:

- [ ] `pnpm validate` passes.
