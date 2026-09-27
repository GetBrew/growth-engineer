---
name: Comment on a Jira work item
summary: Adds a comment to a Jira work item and returns the new comment.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-comments/#api-rest-api-3-issue-issueidorkey-comment-post
mcp: addOrEditJiraIssueComment
cli: acli jira workitem comment create
api: POST /rest/api/3/issue/{issueIdOrKey}/comment
updated: 2026-09-27
---

On the API the comment `body` is Atlassian Document Format; the CLI takes
`--key` and a plain-text or ADF `--body`, and can comment on every work item a
`--jql` query matches. `addOrEditJiraIssueComment` also edits an existing
comment.
