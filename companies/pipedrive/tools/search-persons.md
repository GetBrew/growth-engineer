---
name: Search for people
summary: Returns the people (contacts) in Pipedrive whose name, email, phone, notes or custom fields match a search term, each with a relevance score.
capability: manage-crm
docs: https://developers.pipedrive.com/docs/api/v1/Persons#searchPersons
mcp: searchPersons
api: GET /api/v2/persons/search
updated: 2026-09-27
---

Pass the `term`: at least 2 characters, or 1 with `exact_match` set. Narrow
the match with `fields` (`name`, `email`, `phone`, `notes`, `custom_fields`)
and `organization_id`. Search before you create a person, so you don't add a
contact that already exists.
