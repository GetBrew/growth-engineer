---
name: Enrich a person
summary: Returns a person's verified email and direct and mobile phone numbers, with their title and company, found by email, LinkedIn URL, or first name, last name and company.
capability: enrich-contacts
docs: https://docs.lusha.com/mcp-docs
mcp: contacts_search
api: POST /v3/contacts/search-and-enrich
updated: 2026-09-27
---

Pass one lookup path: an email, a LinkedIn URL, or first name, last name and
company name together. `enrich` defaults to true and reveals phones and email
in the same call. When the match may be ambiguous, call it with
`enrich: false` for a preview that spends no reveal credits, then reveal the
chosen person with `prospecting_contact_enrich`; never do both for the same
person, which charges twice.
