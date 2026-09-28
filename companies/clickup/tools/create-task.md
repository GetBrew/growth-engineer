---
name: Create a task
summary: Creates a task in a List with its name, description, assignees, status, priority, due date and custom fields, and returns the task.
notes: "Statuses differ per List: read the valid ones first with `clickup_get_task` and `expand_statuses: true`. The MCP tool ignores `me` as an assignee, so resolve the current user with `clickup_resolve_assignees` first."
capability: manage-tasks
docs: https://developer.clickup.com/reference/createtask
mcp: clickup_create_task
api: POST /v2/list/{list_id}/task
updated: 2026-09-27
---
