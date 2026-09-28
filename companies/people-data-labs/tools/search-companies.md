---
name: Search companies
summary: Returns up to 100 company records per call that match an Elasticsearch or SQL query over PDL's company fields, such as industry, size, location and funding.
notes: "Each record returned costs one credit, and `size` defaults to 1 (up to 100): set it, and page with `scroll_token`."
capability: find-prospects
docs: https://docs.peopledatalabs.com/docs/reference-company-search-api
api: POST /v5/company/search
updated: 2026-09-27
---
