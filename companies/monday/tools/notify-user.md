---
name: Notify a user
summary: Sends a user a monday.com bell notification that links to an item, a board or an update, with an email if their settings allow.
capability: route-alerts
docs: https://developer.monday.com/api-reference/docs/create-notification
mcp: create_notification
api: POST /v2
updated: 2026-09-27
---

Pass the recipient's `user_id`, the `text`, a `target_id` and its
`target_type`: `Project` for an item or board, `Post` for an update or reply.
Look up user ids with `list_users_and_teams`. On the API, send the
`create_notification` mutation with the same four arguments.
