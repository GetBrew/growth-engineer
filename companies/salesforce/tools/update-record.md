---
name: Update a record
summary: Changes the fields you pass on one record, found by its ID, and leaves every other field as it is.
capability: manage-crm
docs: https://developer.salesforce.com/docs/platform/api-rest/guide/resources-sobject-retrieve-patch.html
mcp: updateSobjectRecord
cli: sf data update record
api: PATCH /services/data/vXX.X/sobjects/sObject/id/
updated: 2026-09-26
---

Use it to move an opportunity's stage or fill in fields from research. It fails if the record does not exist, the user cannot edit it, or a validation rule rejects a value.
