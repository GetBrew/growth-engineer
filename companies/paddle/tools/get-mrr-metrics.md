---
name: Get MRR metrics
summary: Returns daily monthly recurring revenue totals between two dates, counting new subscriptions, upgrades, downgrades and churn.
capability: track-revenue
docs: https://developer.paddle.com/api-reference/metrics/get-metrics-monthly-recurring-revenue
mcp: execute
api: GET /metrics/monthly-recurring-revenue
updated: 2026-09-27
---

`from` and `to` are required RFC 3339 dates; passing the same date for both
returns an empty series. The totals leave out one-time payments and Paddle
fees. An API key needs the `metrics.read` permission. On the MCP server, run it
with `execute`.
