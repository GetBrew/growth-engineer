---
name: Search the web
summary: Returns ranked web results for a query, each with its title, URL, snippet and dates, optionally limited to domains or a date range.
capability: research-accounts
docs: https://docs.perplexity.ai/api-reference/search-post
mcp: perplexity_search
cli: pplx search web
api: POST /search
updated: 2026-09-27
---

On the CLI, `-n` sets the number of results (10 by default), and `--domains`,
`--recency-filter`, the date flags and `--country` apply the Search API's
filters. Extra queries on the CLI are rephrasings of one question, not separate
searches, and come back as a single ranked list.
