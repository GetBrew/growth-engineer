---
name: Create or update an organization
summary: Creates an organization, or updates the one that matches its ID or external ID, and returns it.
capability: manage-crm
docs: https://developer.zendesk.com/api-reference/ticketing/organizations/organizations/#create-or-update-organization
api: POST /api/v2/organizations/create_or_update
updated: 2026-09-27
---

Pass `id` or `external_id` to update an existing organization: the name is
never used for matching, and without either one an existing name returns a
duplicate error. Agents can call it, with restrictions on some actions.
