---
name: List a board's items
summary: Returns a board's items, filtered, searched or sorted, with their column values when asked, one page at a time.
notes: "Call `get_board_info` first for the column ids and status labels filters need. Pages hold 25 items by default and up to 500: pass the returned `nextCursor` as `cursor` for the next page."
capability: manage-tasks
docs: https://developer.monday.com/api-reference/docs/get-board-items
mcp: get_board_items_page
api: POST /v2
updated: 2026-09-27
---
