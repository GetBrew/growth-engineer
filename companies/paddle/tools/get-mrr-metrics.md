---
name: Get MRR metrics
summary: Returns daily monthly recurring revenue totals between two dates, counting new subscriptions, upgrades, downgrades and churn.
notes: An API key needs the `metrics.read` permission. The same date as `from` and `to` returns an empty series, and totals leave out one-time payments and Paddle fees.
capability: track-revenue
docs: https://developer.paddle.com/api-reference/metrics/get-metrics-monthly-recurring-revenue
mcp: execute
api: GET /metrics/monthly-recurring-revenue
updated: 2026-09-27
---
