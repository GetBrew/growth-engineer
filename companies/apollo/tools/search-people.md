---
name: Search people
summary: Returns people in Apollo's database who match title, seniority, location and company filters, without their emails or phone numbers.
notes: "Costs no credits and finds only net-new people, not contacts already saved in Apollo. Returns no emails: enrich the matches to get them. Up to 100 people per page and 50,000 in total."
capability: find-prospects
docs: https://docs.apollo.io/reference/people-api-search
mcp: apollo_mixed_people_api_search
cli: apollo people search
api: POST /mixed_people/api_search
aliases:
  - apollo/build-audience
updated: 2026-09-26
---
