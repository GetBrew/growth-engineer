---
name: Search people
summary: Returns people from Instantly's SuperSearch lead database who match filters such as job title, department, level, location, industry or employee count, without their email addresses.
notes: "Enriches nothing: import the people from SuperSearch to get work emails. `POST /api/v2/supersearch-enrichment/count-leads-from-supersearch` counts matches; the key needs the `supersearch_enrichments:read` scope."
capability: find-prospects
docs: https://developer.instantly.ai/api-reference/supersearchenrichment/preview-leads-from-supersearch
api: POST /api/v2/supersearch-enrichment/preview-leads-from-supersearch
updated: 2026-09-27
---
