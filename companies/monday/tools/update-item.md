---
name: Update an item
summary: Sets one or more column values on an existing item in one call, such as its status, a date or an email.
capability: manage-tasks
docs: https://developer.monday.com/api-reference/docs/change-item-column-values
mcp: change_item_column_values
api: POST /v2
updated: 2026-09-27
---

Pass `columnValues` as a JSON string keyed by column id; each column type has
its own format, such as `{"label": "Done"}` for a status or
`{"date": "2024-06-01"}` for a date. Set `createLabelsIfMissing` to add a
status or dropdown label that doesn't exist yet. On the API, send the
`change_multiple_column_values` mutation with `board_id`, `item_id` and
`column_values`.
