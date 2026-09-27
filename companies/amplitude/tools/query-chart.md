---
name: Query a saved chart
summary: Returns the computed results of a saved event segmentation, sessions, funnel or retention chart for a time range.
capability: track-product-usage
docs: https://amplitude.com/docs/apis/developer/analytics/query-chart
mcp: get_amplitude_charts
cli: amp charts query
api: POST /v1/projects/{project_id}/charts/{chart_id}/query
updated: 2026-09-26
---

Without a time range the query uses the chart's saved range, or the last 30
days. Other chart types return `422` with `unsupported_chart_type`. On the CLI
and the API the token needs the `analytics:read` scope.
