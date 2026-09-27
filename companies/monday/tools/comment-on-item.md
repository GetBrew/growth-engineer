---
name: Comment on an item
summary: Posts an update, monday.com's comment, on an item, or a reply to an existing update, with optional mentions.
capability: manage-tasks
docs: https://developer.monday.com/api-reference/docs/create-update
mcp: create_update
api: POST /v2
updated: 2026-09-27
---

The `body` takes HTML such as `<b>` and `<br>`, not Markdown. Mention users,
teams or boards with `mentionsList`, never with `@` in the body, and pass
`parentId` to reply in a thread. On the API, send the `create_update` mutation
with `item_id` and `body`.
