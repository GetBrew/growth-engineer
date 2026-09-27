---
name: Query a saved report
summary: Returns the data behind a saved report, such as an Insights report, by its ID.
capability: track-product-usage
docs: https://docs.mixpanel.com/reference/insights-query
mcp: Get-Report
cli: mp query saved-report
api: GET /insights
updated: 2026-09-26
---

Over the API, pass the report's `bookmark_id` and `project_id`. The Query API allows 60 queries per hour and 5 concurrent queries.
