---
name: Comment on a task
summary: Adds a comment to a task, optionally assigned to someone, and returns the new comment's id.
capability: manage-tasks
docs: https://developer.clickup.com/reference/createtaskcomment
mcp: clickup_create_comment
api: POST /v2/task/{task_id}/comment
updated: 2026-09-27
---

On the MCP server, pass `entity_type: "task"` and the task id as `entity_id`;
the older `clickup_create_task_comment` is deprecated. On the API,
`comment_text` and `notify_all` are required. The task's assignees and
watchers are always notified; `notify_all: true` notifies the comment's author
as well.
