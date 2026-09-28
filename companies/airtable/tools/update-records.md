---
name: Update records
summary: Changes only the fields you pass on existing records, leaving the rest as they were, and returns the updated records.
notes: "Use `PATCH`: a `PUT` to the same path clears every field you leave out. The MCP tool and the CLI need record ids and field ids, and an API upsert with `performUpsert` fails when several records match."
capability: manage-tables
docs: https://airtable.com/developers/web/api/update-multiple-records
mcp: update_records_for_table
cli: airtable-mcp update-records-for-table
api: PATCH /v0/{baseId}/{tableIdOrName}
updated: 2026-09-27
---
