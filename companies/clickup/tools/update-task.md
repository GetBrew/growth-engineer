---
name: Update a task
summary: Changes the fields you send on a task, such as its name, description, status, priority, dates or assignees, and leaves the rest as they were.
capability: manage-tasks
docs: https://developer.clickup.com/reference/updatetask
mcp: clickup_update_task
api: PUT /v2/task/{task_id}
updated: 2026-09-27
---

Statuses differ per List and must match exactly: confirm them with
`clickup_get_task` and `expand_statuses: true`. On the API, change assignees
with an `assignees` object holding `add` and `rem` arrays of user ids.
