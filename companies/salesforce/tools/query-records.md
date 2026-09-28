---
name: Query records with SOQL
summary: Runs a SOQL query and returns the matching records with the fields it selects.
notes: One response holds up to 2,000 records; when there are more, fetch the next batch from `nextRecordsUrl`.
capability: manage-crm
docs: https://developer.salesforce.com/docs/platform/api-rest/guide/resources-query.html
mcp: soqlQuery
cli: sf data query
api: GET /services/data/vXX.X/query
updated: 2026-09-26
---
