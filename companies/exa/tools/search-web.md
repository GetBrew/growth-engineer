---
name: Search the web
summary: Returns web pages that match a natural-language query, up to 100 per call, with their text, highlights or summaries, and can focus on company pages, people profiles or news.
capability: research-accounts
docs: https://exa.ai/docs/reference/search
mcp: web_search_exa
api: POST /search
updated: 2026-09-27
---

Set `category` to `company` or `people` to find company pages and
professional profiles, and `type` to trade speed for depth, from `instant` to
`deep-reasoning`. Ask for page content in the same call with `contents`. The
MCP tool keeps a smaller set of options; for domain, date and category
filters, list `web_search_advanced_exa` in the server URL's `tools`
parameter, along with every other tool you want, since the list replaces the
defaults.
