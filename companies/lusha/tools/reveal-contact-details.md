---
name: Reveal emails and phone numbers
summary: Reveals the emails and direct and mobile phone numbers of up to 50 contacts found by search, charging only for the fields you ask to reveal.
notes: Takes contact `id`s from a people search. Add up `canReveal[].credits` before a large batch and check your balance with `account_usage`; data already revealed for your account costs nothing again.
capability: find-work-emails
docs: https://docs.lusha.com/mcp-docs
mcp: prospecting_contact_enrich
api: POST /v3/contacts/enrich
updated: 2026-09-27
---
