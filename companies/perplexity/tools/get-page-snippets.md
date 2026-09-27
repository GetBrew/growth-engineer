---
name: Get page snippets
summary: Returns only the passages of one or more web pages that are relevant to a query, as JSON.
capability: scrape-web
docs: https://docs.perplexity.ai/docs/cli/overview
cli: pplx content snippets
updated: 2026-09-27
---

Pass the query, then up to 50 URLs; each page is snipped on its own.
`--max-tokens` (4096 by default) and `--max-tokens-per-page` cap the text. A
page that can't be snipped returns an `error` instead of `text` without failing
the command, so check every result. Needs CLI v0.2.3 or later.
