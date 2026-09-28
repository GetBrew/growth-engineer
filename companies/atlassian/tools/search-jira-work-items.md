---
name: Search Jira work items with JQL
summary: Returns the Jira work items that match a JQL query, with the fields you ask for, one page at a time.
notes: Page with `nextPageToken`. The older `/rest/api/3/search` is deprecated and being removed; for a query too long for a URL, use `POST /rest/api/3/search/jql`.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-jql-get
mcp: searchJiraIssuesUsingJql
cli: acli jira workitem search
api: GET /rest/api/3/search/jql
updated: 2026-09-27
---
