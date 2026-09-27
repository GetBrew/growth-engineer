---
name: Create a task
summary: Creates a task in a workspace, a project or under a parent task, with its assignee, due date, description and custom fields.
capability: manage-tasks
docs: https://developers.asana.com/reference/createtask
mcp: create_tasks
api: POST /tasks
aliases:
  - asana/manage-tasks
updated: 2026-09-26
---

Every task belongs to a workspace: set `workspace`, or set `projects` or
`parent` instead. The MCP tool creates up to 50 tasks per call, without a
confirmation step.
