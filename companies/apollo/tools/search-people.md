---
name: Search for people
summary: Returns people in Apollo's database who match title, seniority, location and company filters, without their emails or phone numbers.
capability: build-audience
docs: https://docs.apollo.io/reference/people-api-search
mcp: apollo_mixed_people_api_search
cli: apollo people search
api: POST /mixed_people/api_search
aliases:
  - apollo/build-audience
updated: 2026-09-26
---

Search costs no credits and finds net-new people, not contacts already saved
in Apollo. It returns up to 100 people per page and 50,000 in total, so narrow
it with filters such as `person_titles`, `person_seniorities` and
`q_organization_domains_list`. Enrich the matches to get their work emails.
