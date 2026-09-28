---
name: Search people
summary: Returns up to 100 person records per call that match an Elasticsearch or SQL query over PDL's person fields, such as job title, employer, location and skills.
notes: "Each record returned costs one credit, and `size` defaults to 1 (up to 100): set it, and page with `scroll_token`. Send `query` or `sql`, not both. The default rate limit is 10 requests per minute."
capability: find-prospects
docs: https://docs.peopledatalabs.com/docs/reference-person-search-api
api: POST /v5/person/search
updated: 2026-09-27
---
