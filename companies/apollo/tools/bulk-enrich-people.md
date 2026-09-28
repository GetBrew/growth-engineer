---
name: Enrich up to 10 people
summary: Returns the work email, title and employer of up to 10 people in one call, each matched from a name and company domain, an email or a LinkedIn URL.
notes: Credits are charged per person, only when data is found; unmatched people come back as `null`. Personal emails and phone numbers are off unless you set `reveal_personal_emails` or `reveal_phone_number`.
capability: enrich-contacts
docs: https://docs.apollo.io/reference/bulk-people-enrichment
mcp: apollo_people_bulk_match
cli: apollo people bulk-enrich
api: POST /people/bulk_match
aliases:
  - apollo/find-work-emails
updated: 2026-09-27
---
