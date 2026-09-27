---
name: Search companies
summary: Returns up to 100 company records per call that match an Elasticsearch or SQL query over PDL's company fields, such as industry, size, location and funding.
capability: build-audience
docs: https://docs.peopledatalabs.com/docs/reference-company-search-api
api: POST /v5/company/search
updated: 2026-09-27
---

Send either `query` (Elasticsearch) or `sql`. Each record returned costs one
credit, so set `size` (1 to 100, default 1) and page with `scroll_token`.
