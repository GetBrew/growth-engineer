---
name: Create or update a user
summary: Creates a user, an end user unless you set a role, or updates the one that matches the email or external ID, and returns the full user.
capability: manage-crm
docs: https://developer.zendesk.com/api-reference/ticketing/users/users/#create-or-update-user
api: POST /api/v2/users/create_or_update
updated: 2026-09-27
---

The response is 201 when the user is created and 200 when an existing user is
updated. Add `"skip_verify_email": true` to create a user without sending a
verification email. Needs an admin, or an agent whose custom role can manage
end users or team members.
