---
name: Search Trello
summary: Finds the boards, cards, members and organizations that match a query.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/trello/rest/api-group-search/#api-search-get
api: GET /search
updated: 2026-09-26
---

`query` is required; narrow it with `idBoards`, `idOrganizations` or `modelTypes`, and cap results with `cards_limit` and `boards_limit`.
