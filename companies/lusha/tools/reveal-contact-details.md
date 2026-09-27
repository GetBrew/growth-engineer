---
name: Reveal emails and phone numbers
summary: Reveals the emails and direct and mobile phone numbers of up to 50 contacts found by search, charging only for the fields you ask to reveal.
capability: find-work-emails
docs: https://docs.lusha.com/mcp-docs
mcp: prospecting_contact_enrich
api: POST /v3/contacts/enrich
updated: 2026-09-27
---

Pass the contact `id`s from a search and set `reveal` from each result's
`canReveal[].field`. Add up `canReveal[].credits` to know the cost before a
large batch, and check your balance with `account_usage`. Data already
revealed for your account costs nothing to reveal again.
