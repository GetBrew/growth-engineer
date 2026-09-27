---
name: Query tables and metrics
summary: Runs a query against a table or saved metric through the semantic layer and returns the results.
capability: track-product-usage
docs: https://www.metabase.com/docs/latest/ai/agent-api
mcp: query
api: POST /api/agent/v1/query
updated: 2026-09-27
---

The API returns at most 200 rows per request, with a `continuation_token` to pass back for the next page.
