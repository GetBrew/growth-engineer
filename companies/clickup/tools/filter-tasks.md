---
name: Filter tasks in a Workspace
summary: Returns the tasks across a Workspace that match filters such as Lists, statuses, assignees, tags and dates, 100 per page.
notes: Closed tasks are left out unless you set `include_closed`, and statuses match only by exact name. On the API, `page` starts at 0.
capability: manage-tasks
docs: https://developer.clickup.com/reference/getfilteredteamtasks
mcp: clickup_filter_tasks
api: GET /v2/team/{team_Id}/task
updated: 2026-09-27
---
