---
name: Enrich a person
summary: Returns a person's verified email and direct and mobile phone numbers, with their title and company, found by email, LinkedIn URL, or first name, last name and company.
notes: "By default it reveals phones and email, which spends credits. When the match may be ambiguous, preview with `enrich: false`, then reveal the chosen person with `prospecting_contact_enrich`; doing both for one person charges twice."
capability: enrich-contacts
docs: https://docs.lusha.com/mcp-docs
mcp: contacts_search
api: POST /v3/contacts/search-and-enrich
updated: 2026-09-27
---
