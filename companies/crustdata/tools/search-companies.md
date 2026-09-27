---
name: Search companies
summary: Searches Crustdata's company database with structured filters, a natural-language query or both, and returns ranked companies with a cursor for the next page.
capability: build-audience
docs: https://docs.crustdata.com/api-reference/company-apis/search-companies-with-indexed-fields-only
cli: crustdata company search
api: POST /company/search
updated: 2026-09-26
---

Up to 100 results per page. Pages cost credits, so follow `next_cursor`
only as far as you need.
