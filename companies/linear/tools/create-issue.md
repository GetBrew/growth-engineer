---
name: Create or update an issue
summary: Creates an issue in a team with its title, description, assignee, labels and priority, or updates an existing issue when you pass its id.
capability: manage-tasks
docs: https://linear.app/developers/graphql
mcp: save_issue
api: POST /graphql
updated: 2026-09-27
---

On the API, send the `issueCreate` mutation with a `teamId` and a `title`, or
`issueUpdate` with the issue's id (its UUID or a key like `BLA-123`) and only
the fields to change. An issue created through the API without a `stateId`
lands in the team's first Backlog state, or in Triage when the team uses it;
through the MCP server it takes the team's default state when you are a member
of the team. `save_issue` replaced the separate `create_issue` and
`update_issue` tools.
