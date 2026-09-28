---
name: Create or update a user
summary: Creates a user, an end user unless you set a role, or updates the one that matches the email or external ID, and returns the full user.
notes: "Sends a verification email to a new user unless you add `\"skip_verify_email\": true`. Needs an admin, or an agent whose custom role can manage end users or team members."
capability: manage-crm
docs: https://developer.zendesk.com/api-reference/ticketing/users/users/#create-or-update-user
api: POST /api/v2/users/create_or_update
updated: 2026-09-27
---
