---
name: Create a cohort
summary: Creates a cohort of persons from property or behavioral filters, or a static cohort from a list of person IDs.
notes: Needs a personal API key with the `cohort:write` scope.
capability: build-audience
docs: https://posthog.com/docs/api/cohorts
mcp: cohorts-create
cli: posthog-cli api call cohorts-create
api: POST /api/projects/{project_id}/cohorts/
updated: 2026-09-26
---
