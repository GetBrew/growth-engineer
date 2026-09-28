---
name: Run a SQL query
summary: Runs a SQL (HogQL) query over the project's events, persons and other data and returns the rows.
notes: Needs a personal API key with the `query:read` scope. Returns up to 100 rows by default and up to 50,000 with an explicit `LIMIT`; it is for ad-hoc analysis, not bulk export.
capability: analyze-product-usage
docs: https://posthog.com/docs/api/query
mcp: execute-sql
cli: posthog-cli api call execute-sql
api: POST /api/projects/{project_id}/query/
aliases:
  - posthog/track-product-usage
  - posthog/track-intent
updated: 2026-09-26
---
