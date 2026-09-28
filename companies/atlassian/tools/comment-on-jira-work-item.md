---
name: Comment on a Jira work item
summary: Adds a comment to a Jira work item and returns the new comment.
notes: On the API the comment `body` must be Atlassian Document Format, not plain text. On the CLI, `--jql` comments on every work item the query matches.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-comments/#api-rest-api-3-issue-issueidorkey-comment-post
mcp: addOrEditJiraIssueComment
cli: acli jira workitem comment create
api: POST /rest/api/3/issue/{issueIdOrKey}/comment
updated: 2026-09-27
---
