---
name: Create a lead
summary: Creates a lead (a company) and returns it with its ID; over the API its contacts, addresses and custom fields can be created in the same call.
capability: manage-crm
docs: https://developer.close.com/api/resources/leads/create
mcp: create_lead
api: POST /lead/
updated: 2026-09-27
---

Set the status with `status_id` rather than the status label, so renaming a
status in Close doesn't break the call; without one, the organization's
default status is used. Custom fields go in `custom.<field id>` keys.
Opportunities, tasks and activities are created with their own calls.
