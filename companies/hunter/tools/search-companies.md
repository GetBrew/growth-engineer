---
name: Search companies
summary: Returns up to 100 companies that match a plain-language description or filters such as headquarters location, industry, headcount and company type, at no credit cost.
capability: build-audience
docs: https://hunter.io/api-documentation/v2#discover
mcp: Find-Companies
api: POST /discover
updated: 2026-09-27
---

Hunter calls this Discover. Send a natural-language `query`, such as
"Companies in Europe in the Tech Industry", or filters such as
`headquarters_location`, `industry`, `headcount` and `keywords`; some filters,
such as `technology`, `year_founded` and `similar_to`, need a Premium plan, as
does paging with `offset`. Then list each company's contacts with a domain
search.
