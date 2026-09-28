---
name: Start an AI visibility scan
summary: Runs a project's tracked prompts across AI answer engines and records where the brand and its competitors are mentioned.
notes: Uses billed AI credits and can take minutes; confirm before starting. Get the project id from `list_projects` (`notra geo projects list`) first, then read the results from the scan or the visibility overview.
capability: track-ai-visibility
docs: https://docs.usenotra.com/api-reference/geo/trigger-a-geo-scan
mcp: create_geo_scan
cli: notra geo scans start
api: POST /v1/projects/{projectId}/geo/scans
updated: 2026-09-28
---
