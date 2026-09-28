---
name: Search contacts
summary: Returns the users and leads whose attributes, such as email, email domain, name, phone or a custom attribute, match your filters.
notes: A contact created in the last few minutes may not show up yet, and merged contacts never do. Up to 15 filters per group and 2 levels of nesting; 50 contacts per page by default, paged with `starting_after`.
capability: manage-crm
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/contacts/searchcontacts
mcp: search_contacts
api: POST /contacts/search
updated: 2026-09-27
---
