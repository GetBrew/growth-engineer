---
name: Search records with SOSL
summary: Runs a SOSL text search across several objects at once and returns the matches grouped by object.
capability: manage-crm
docs: https://developer.salesforce.com/docs/platform/api-rest/guide/resources-search.html
mcp: find
cli: sf data search
api: GET /services/data/vXX.X/search/
updated: 2026-09-26
---

Use it when a name or email could be on a Lead, a Contact or an Account, for example `FIND {Acme} IN NAME FIELDS RETURNING Account(Id, Name), Contact(Id, Name, Email)`. Pass the URL-encoded search in `q`.
