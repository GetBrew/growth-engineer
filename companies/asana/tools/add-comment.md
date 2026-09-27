---
name: Comment on a task
summary: Adds a comment to a task as the signed-in user, in plain text or HTML, with optional @-mentions.
capability: manage-tasks
docs: https://developers.asana.com/reference/createstoryfortask
mcp: add_comment
api: POST /tasks/{task_gid}/stories
updated: 2026-09-26
---

On the API a comment is a story on the task; the endpoint only creates
comment stories.
