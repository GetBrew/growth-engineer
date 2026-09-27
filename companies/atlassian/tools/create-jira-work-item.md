---
name: Create a Jira work item
summary: Creates a Jira work item (an issue) in a project with its type, summary, description, assignee and labels, and returns its key.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post
mcp: createJiraIssue
cli: acli jira workitem create
api: POST /rest/api/3/issue
updated: 2026-09-27
---

The fields a work item accepts depend on its project and type: read them first
with `GET /rest/api/3/issue/createmeta/{projectIdOrKey}/issuetypes`. On the
API, `description` takes Atlassian Document Format; the CLI takes it as plain
text or ADF, for example
`acli jira workitem create --summary "New Task" --project "TEAM" --type "Task"`.
