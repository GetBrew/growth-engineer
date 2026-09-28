---
name: Notify a user
summary: Sends a user a monday.com bell notification that links to an item, a board or an update, with an email if their settings allow.
notes: "Needs the recipient's `user_id`: look it up with `list_users_and_teams`. Set `target_type` to `Project` for an item or board, `Post` for an update or reply."
capability: route-alerts
docs: https://developer.monday.com/api-reference/docs/create-notification
mcp: create_notification
api: POST /v2
updated: 2026-09-27
---
