---
name: Create or update a profile
summary: Creates a profile or updates the one that matches, with contact details, location and custom properties.
capability: build-audience
docs: https://developers.klaviyo.com/en/reference/create_or_update_profile
mcp: create_or_update_profile
cli: klaviyo profiles create-or-update-profile
api: POST /api/profile-import
updated: 2026-09-27
---

Returns 201 for a new profile and 200 for an updated one. A field set to
`null` is cleared, and a field left out keeps its value. To give a profile
consent to receive marketing, subscribe it with Bulk Subscribe Profiles.
