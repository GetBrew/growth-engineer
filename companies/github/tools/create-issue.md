---
name: Create an issue
summary: Opens a new issue in a repository with a title, body, labels and assignees.
notes: "On MCP, `issue_write` also updates issues: pass `method: create` with `owner`, `repo` and `title`."
capability: manage-code
docs: https://docs.github.com/en/rest/issues/issues#create-an-issue
mcp: issue_write
cli: gh issue create
api: POST /repos/{owner}/{repo}/issues
aliases:
  - github/manage-code
updated: 2026-09-26
---
