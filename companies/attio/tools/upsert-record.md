---
name: Create or update a record
summary: Updates the record whose matching attribute, such as a company's domain or a person's email, has the given value, or creates the record if none does.
notes: The `matching_attribute` must be a unique attribute. Deals have no unique attribute by default, so add one before upserting deals.
capability: manage-crm
docs: https://docs.attio.com/rest-api/endpoint-reference/records/upsert-a-record
mcp: upsert-record
api: PUT /v2/objects/{object}/records
aliases:
  - attio/manage-crm
updated: 2026-09-26
---
