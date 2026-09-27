---
name: Enrich a company
summary: Returns a company's firmographics, headcount, funding, web traffic, employee reviews, key people and news, found by domain, name, profile URL or Crustdata ID.
capability: research-accounts
docs: https://docs.crustdata.com/api-reference/company-apis/get-full-company-enrichment
cli: crustdata company enrich
api: POST /company/enrich
updated: 2026-09-26
---

Pass `fields` to pick only the data groups you need and keep the response
small.
