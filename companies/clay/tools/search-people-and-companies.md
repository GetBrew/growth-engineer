---
name: Search people and companies
summary: Starts a search of Clay's database of people or companies from an advanced search query and returns a search id to page through the matches.
notes: Read the query reference first (`GET /search/query-mode/reference`), then page with `POST /search/query-mode/{search_id}/run` while `has_more` is true. Results per search and per 30 days are capped by plan.
capability: find-prospects
docs: https://developers.clay.com/api-reference/search/create-a-search-from-a-clay-search-query
cli: clay searches query-mode create
api: POST /search/query-mode
aliases:
  - clay/build-audience
updated: 2026-09-26
---
