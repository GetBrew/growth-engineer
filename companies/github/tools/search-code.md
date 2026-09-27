---
name: Search code
summary: Returns files, and the repositories they live in, whose code matches a query such as an import of a package.
capability: research-accounts
docs: https://docs.github.com/en/rest/search/search#search-code
mcp: search_code
cli: gh search code
api: GET /search/code
updated: 2026-09-26
---

Qualifiers such as `org:`, `language:`, `filename:` and `extension:` narrow the match. The REST endpoint requires authentication and allows 10 requests per minute.
