---
name: Search records
summary: Finds the records in a table whose searchable fields match a keyword, such as a company name.
capability: manage-tables
docs: https://airtable.com/developers/agents/mcp/tools
mcp: search_records
cli: airtable-mcp search-records
updated: 2026-09-27
---

Use it for free-text or fuzzy lookups on large tables; to match exact field
values, filter with `list_records_for_table` instead. Pass
`ALL_SEARCHABLE_FIELDS` as the fields to search every indexed field. Date,
rating, checkbox and button fields are not searchable.
