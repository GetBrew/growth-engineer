---
name: Filter tasks in a Workspace
summary: Returns the tasks across a Workspace that match filters such as Lists, statuses, assignees, tags and dates, 100 per page.
capability: manage-tasks
docs: https://developer.clickup.com/reference/getfilteredteamtasks
mcp: clickup_filter_tasks
api: GET /v2/team/{team_Id}/task
updated: 2026-09-27
---

Closed tasks are left out unless you set `include_closed`, and statuses are
matched by their exact names. On the API, `team_Id` is the Workspace id, the
filters are array parameters such as `list_ids[]` and `assignees[]`, and
`page` starts at 0. The MCP tool returns `has_more` and `next_page`.
