---
name: Get page snippets
summary: Returns only the passages of one or more web pages that are relevant to a query, as JSON.
notes: Takes up to 50 URLs. A page that can't be snipped returns an `error` instead of `text` without failing the command, so check every result. Needs CLI v0.2.3 or later.
capability: scrape-web
docs: https://docs.perplexity.ai/docs/cli/overview
cli: pplx content snippets
updated: 2026-09-27
---
