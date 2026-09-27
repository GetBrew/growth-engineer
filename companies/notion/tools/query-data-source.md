---
name: Query a data source
summary: Returns the pages in a data source that match a filter, in the requested sort order.
capability: manage-docs
docs: https://developers.notion.com/reference/query-a-data-source
mcp: notion-query-data-sources
cli: ntn datasources query <data-source-id>
api: POST /v1/data_sources/{data_source_id}/query
updated: 2026-09-26
---

`notion-query-data-sources` can also run SQL across data sources or run a saved view. SQL is unlimited on Business and Enterprise plans with Notion AI; on other plans, rows mode and single-data-source SQL share a per-workspace allowance.
