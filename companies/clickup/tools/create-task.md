---
name: Create a task
summary: Creates a task in a List with its name, description, assignees, status, priority, due date and custom fields, and returns the task.
capability: manage-tasks
docs: https://developer.clickup.com/reference/createtask
mcp: clickup_create_task
api: POST /v2/list/{list_id}/task
updated: 2026-09-27
---

`name` is the only required field. Statuses differ per List, so read the valid
ones before setting one (`clickup_get_task` with `expand_statuses: true`). The
MCP tool takes assignees as emails, usernames or numeric ids but ignores
`me`: resolve the current user with `clickup_resolve_assignees` first, and
pass `workspace_id` when the user belongs to more than one Workspace. Custom
field values save only when the field applies to the task's `custom_item_id`.
