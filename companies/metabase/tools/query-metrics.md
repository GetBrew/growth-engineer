---
name: Query tables and metrics
summary: Runs a query against a table or saved metric through the semantic layer and returns the results.
notes: "Returns at most 200 rows per request: pass the returned `continuation_token` back for the next page."
capability: analyze-product-usage
docs: https://www.metabase.com/docs/latest/ai/agent-api
mcp: query
api: POST /api/agent/v1/query
updated: 2026-09-27
---
