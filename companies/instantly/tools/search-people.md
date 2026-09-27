---
name: Search people
summary: Returns people from Instantly's SuperSearch lead database who match filters such as job title, department, level, location, industry or employee count, without their email addresses.
capability: build-audience
docs: https://developer.instantly.ai/api-reference/supersearchenrichment/preview-leads-from-supersearch
api: POST /api/v2/supersearch-enrichment/preview-leads-from-supersearch
updated: 2026-09-27
---

Put the filters in `search_filters`, for example `title` with `include` and
`exclude` lists. `POST /api/v2/supersearch-enrichment/count-leads-from-supersearch`
takes the same filters and counts the matches. The preview enriches nothing;
to add the people to a list with their work emails, import them from
SuperSearch. The key needs the `supersearch_enrichments:read` scope (or
`supersearch_enrichments:all`, `all:read`, `all:all`).
