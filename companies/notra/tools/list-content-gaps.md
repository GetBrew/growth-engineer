---
name: List content gaps
summary: Lists the tracked prompts where AI answer engines mention competitors but not the brand, with the engines, the competitors and an opportunity score.
notes: Needs a GEO plan or AI credits. Get the project id from `list_projects` (`notra geo projects list`) first. A gap's `id` is what a content brief takes as `sourceId`, with `sourceKind` set to `gap`.
capability: track-ai-visibility
docs: https://docs.usenotra.com/api-reference/geo/list-content-gaps
mcp: list_geo_content_gaps
cli: notra geo gaps list
api: GET /v1/projects/{projectId}/geo/gaps
updated: 2026-09-29
---
