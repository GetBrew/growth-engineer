---
name: Enrich a person
summary: Returns one person's title, employer, employment history and work email, matched from an email, a LinkedIn URL, or a name plus company.
notes: A match costs 1 credit, plus 8 for a mobile phone; no match costs nothing. Personal emails and phone numbers are off unless you set `reveal_personal_emails` or `reveal_phone_number`, and phone numbers arrive later at a `webhook_url`.
capability: enrich-contacts
docs: https://docs.apollo.io/reference/people-enrichment
mcp: apollo_people_match
cli: apollo people enrich
api: POST /people/match
aliases:
  - apollo/enrich-contacts
updated: 2026-09-26
---
