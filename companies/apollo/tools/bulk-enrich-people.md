---
name: Enrich up to 10 people
summary: Returns the work email, title and employer of up to 10 people in one call, each matched from a name and company domain, an email or a LinkedIn URL.
capability: enrich-contacts
docs: https://docs.apollo.io/reference/bulk-people-enrichment
mcp: apollo_people_bulk_match
cli: apollo people bulk-enrich
api: POST /people/bulk_match
aliases:
  - apollo/find-work-emails
updated: 2026-09-27
---

Pass each person as an object in `details[]`; people Apollo can't match come
back as `null`. Personal emails and phone numbers are off by default: set
`reveal_personal_emails` or `reveal_phone_number` to request them. Credits are
charged per person, and only when data is found.
