---
name: Create a record
summary: Creates a record of any object, such as a Lead, Contact or Opportunity, and returns its new ID.
capability: manage-crm
docs: https://developer.salesforce.com/docs/platform/api-rest/guide/resources-sobject-basic-info-post.html
mcp: createSobjectRecord
cli: sf data create record
api: POST /services/data/vXX.X/sobjects/sObject/
updated: 2026-09-26
---

Replace `sObject` with the object's API name, such as `Lead`, and send the field values in the body; the call fails if a required field is missing. Every call runs as the signed-in user, within their object permissions and field-level security.
