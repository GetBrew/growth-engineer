---
name: List issues
summary: Returns the issues that match a filter on fields such as assignee, label, status, project or priority, one page at a time.
notes: "Returns 50 issues at a time by default: pass `pageInfo.endCursor` as `after` for the next page."
capability: manage-tasks
docs: https://linear.app/developers/filtering
mcp: list_issues
api: POST /graphql
updated: 2026-09-27
---
