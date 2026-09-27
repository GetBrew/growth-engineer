---
name: List records
summary: Returns a table's records a page at a time, filtered, sorted and cut down to the fields you ask for.
capability: manage-tables
docs: https://airtable.com/developers/web/api/list-records
mcp: list_records_for_table
cli: airtable-mcp list-records-for-table
api: GET /v0/{baseId}/{tableIdOrName}
updated: 2026-09-27
---

The API returns up to 100 records per page with an `offset` for the next one;
narrow it with `filterByFormula`, `view`, `sort` and `fields`. When a formula
makes the URL too long, `POST /v0/{baseId}/{tableIdOrName}/listRecords` takes
the same parameters in the body. The MCP tool and the CLI filter with
structured JSON in `filters`, not formulas. Fields with empty values are left
out of each record.
