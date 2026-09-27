---
name: Run a SQL query
summary: Runs a SQL (HogQL) query over the project's events, persons and other data and returns the rows.
capability: track-product-usage
docs: https://posthog.com/docs/api/query
mcp: execute-sql
cli: posthog-cli api call execute-sql
api: POST /api/projects/:project_id/query/
aliases:
  - posthog/track-product-usage
  - posthog/track-intent
updated: 2026-09-26
---

Over the API, send the SQL as `{"query": {"kind": "HogQLQuery", "query": "..."}}` with a personal API key that has the `query:read` scope. A query returns up to 100 rows by default and up to 50,000 with an explicit `LIMIT`; the endpoint is for ad-hoc analysis, not bulk export.
