---
name: Update records
summary: Changes only the fields you pass on existing records, leaving the rest as they were, and returns the updated records.
capability: manage-tables
docs: https://airtable.com/developers/web/api/update-multiple-records
mcp: update_records_for_table
cli: airtable-mcp update-records-for-table
api: PATCH /v0/{baseId}/{tableIdOrName}
updated: 2026-09-27
---

A `PUT` to the same path clears every field you leave out, so use `PATCH`. On
the API, set `performUpsert` with `fieldsToMergeOn`, such as an email field,
to update the record that matches or create one when none does; the request
fails when several records match. The MCP tool and the CLI update records by
id and take field ids.
