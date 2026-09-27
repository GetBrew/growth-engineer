---
name: Search for people
summary: Returns up to 100 person records per call that match an Elasticsearch or SQL query over PDL's person fields, such as job title, employer, location and skills.
capability: build-audience
docs: https://docs.peopledatalabs.com/docs/reference-person-search-api
api: POST /v5/person/search
updated: 2026-09-27
---

Send either `query` (Elasticsearch) or `sql`, not both. Each record returned
costs one credit, so set `size` (1 to 100, default 1) and fetch the next page
with the `scroll_token` from the previous response. The default rate limit is
10 requests per minute.
