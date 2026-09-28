---
name: Comment on a task
summary: Adds a comment to a task, optionally assigned to someone, and returns the new comment's id.
notes: "The task's assignees and watchers are always notified. On the MCP server pass `entity_type: \"task\"` with the task id as `entity_id`; on the API `notify_all` is required."
capability: manage-tasks
docs: https://developer.clickup.com/reference/createtaskcomment
mcp: clickup_create_comment
api: POST /v2/task/{task_id}/comment
updated: 2026-09-27
---
