---
name: List issues
summary: Returns the issues that match a filter on fields such as assignee, label, status, project or priority, one page at a time.
capability: manage-tasks
docs: https://linear.app/developers/filtering
mcp: list_issues
api: POST /graphql
updated: 2026-09-27
---

On the API, query `issues` with a `filter` built from comparators such as
`eq`, `in` and `lte`, for example `assignee: { email: { eq: "..." } }`.
Results come 50 at a time by default: pass `pageInfo.endCursor` as `after` to
get the next page. `list_issues` pages its results as well.
