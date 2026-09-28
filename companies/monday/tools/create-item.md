---
name: Create an item
summary: Creates an item, a row on a board, with its name and column values, and returns the item's id and URL.
notes: Read the board first with `get_board_info` for its column ids, group ids and status labels. The item lands in the board's top group unless you pass `groupId`.
capability: manage-tasks
docs: https://developer.monday.com/api-reference/docs/create-item
mcp: create_item
api: POST /v2
updated: 2026-09-27
---
