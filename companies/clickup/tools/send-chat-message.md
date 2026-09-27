---
name: Send a Chat message
summary: Posts a message to a ClickUp Chat channel, such as an alert for a team, and returns the message.
capability: route-alerts
docs: https://developer.clickup.com/reference/createchatmessage
mcp: clickup_send_chat_message
api: POST /v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages
updated: 2026-09-27
---

Find the channel with `clickup_get_chat_channels`, then pass its `channel_id`
and the message `content`. On the API, `type` (`message` or `post`) and
`content` are required, and content is Markdown by default. The reference
prints this path as `/api/v3/...` under `https://api.clickup.com`, which is
the same URL.
