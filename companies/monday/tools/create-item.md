---
name: Create an item
summary: Creates an item, a row on a board, with its name and column values, and returns the item's id and URL.
capability: manage-tasks
docs: https://developer.monday.com/api-reference/docs/create-item
mcp: create_item
api: POST /v2
updated: 2026-09-27
---

Read the board first with `get_board_info` for its column ids, column types,
group ids and status labels. `columnValues` is a JSON string keyed by column
id, such as `{"status_col": {"label": "Done"}}`, and the item lands in the
board's top group unless you pass `groupId`. On the API, send the
`create_item` mutation with `board_id`, `item_name` and `column_values`.
