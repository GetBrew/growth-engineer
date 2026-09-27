---
name: Enrich a person
summary: Returns one person's title, employer, employment history and work email, matched from an email, a LinkedIn URL, or a name plus company.
capability: enrich-contacts
docs: https://docs.apollo.io/reference/people-enrichment
mcp: apollo_people_match
cli: apollo people enrich
api: POST /people/match
aliases:
  - apollo/enrich-contacts
updated: 2026-09-26
---

The more identifiers you pass, the likelier a match; check `match_confidence`
in the response. Personal emails and phone numbers are off by default: set
`reveal_personal_emails` or `reveal_phone_number` (phone numbers arrive later
at a `webhook_url`). A match costs 1 credit for demographics or an email and 8
more for a mobile phone; a request that finds nothing costs nothing.
