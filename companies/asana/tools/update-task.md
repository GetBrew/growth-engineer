---
name: Update a task
summary: Changes a task's name, assignee, due date, description, completion or custom fields, leaving every other field as it was.
capability: manage-tasks
docs: https://developers.asana.com/reference/updatetask
mcp: update_tasks
api: PUT /tasks/{task_gid}
updated: 2026-09-26
---

Only the fields in the request's `data` block change. The MCP tool updates up
to 50 tasks per call.
