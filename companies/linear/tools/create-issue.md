---
name: Create or update an issue
summary: Creates an issue in a team with its title, description, assignee, labels and priority, or updates an existing issue when you pass its id.
notes: Needs a `teamId`. Without a `stateId`, an API-created issue lands in the team's first Backlog state, or in Triage when the team uses it.
capability: manage-tasks
docs: https://linear.app/developers/graphql
mcp: save_issue
api: POST /graphql
updated: 2026-09-27
---
