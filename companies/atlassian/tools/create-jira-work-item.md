---
name: Create a Jira work item
summary: Creates a Jira work item (an issue) in a project with its type, summary, description, assignee and labels, and returns its key.
notes: "The fields a work item accepts depend on its project and type: read them first with `GET /rest/api/3/issue/createmeta/{projectIdOrKey}/issuetypes`. On the API, `description` must be Atlassian Document Format."
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post
mcp: createJiraIssue
cli: acli jira workitem create
api: POST /rest/api/3/issue
updated: 2026-09-27
---
