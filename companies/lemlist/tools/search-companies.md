---
name: Search companies
summary: Returns companies from lemlist's database that match filters such as industry, company size or technologies used, with their location, employee count and technologies.
capability: build-audience
docs: https://developer.lemlist.com/api-reference/endpoints/people-database/search-companies-database
cli: lemlist api POST /database/companies
api: POST /database/companies
updated: 2026-09-27
---

Filters take the same shape as the people search: a `filterId`, such as
`industry`, `companySize` or `currentCompanyTechnologies`, with `in` and `out`
value lists; `GET /database/filters` lists them. Pages hold up to 500
companies (`size`, 100 by default).
