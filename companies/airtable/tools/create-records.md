---
name: Create records
summary: Creates one or more records in a table from their field values and returns each new record with its id.
capability: manage-tables
docs: https://airtable.com/developers/web/api/create-records
mcp: create_records_for_table
api: POST /v0/{baseId}/{tableIdOrName}
updated: 2026-09-27
---

Write in batches of up to 10 records per request by default; the limit varies
by account. The API keys fields by name or id and, with `typecast: true`,
converts strings to each field's type; the MCP tool and the CLI take field ids.
Address the table by its id rather than its name so a rename doesn't break the
call.
