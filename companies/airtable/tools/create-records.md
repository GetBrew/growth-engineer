---
name: Create records
summary: Creates one or more records in a table from their field values and returns each new record with its id.
notes: Writes up to 10 records per request by default; the limit varies by account. The MCP tool takes field ids, not names, and addressing the table by id keeps the call working after a rename.
capability: manage-tables
docs: https://airtable.com/developers/web/api/create-records
mcp: create_records_for_table
api: POST /v0/{baseId}/{tableIdOrName}
updated: 2026-09-27
---
