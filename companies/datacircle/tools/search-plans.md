---
name: Search the API plans
summary: Returns the sheet's rows, one for each plan of each call, with its provider, price per 1,000, score out of 100, rate limits, speed and the fields it returns.
notes: Pass `api` as `list_apis` names it; `query` matches words in the provider's or plan's name. Sorts by score, best first, unless `sort` is provider or price. Up to 50 plans a call, paged with `limit` and `offset`.
capability: compare-apis
docs: https://api.datacircle.dev/v1/openapi.json
mcp: search_plans
api: GET /plans
updated: 2026-11-09
---
