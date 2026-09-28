---
name: Send a Chat message
summary: Posts a message to a ClickUp Chat channel, such as an alert for a team, and returns the message.
notes: "Needs the channel's id: find it with `clickup_get_chat_channels` first. On the API, `type` (`message` or `post`) is required."
capability: route-alerts
docs: https://developer.clickup.com/reference/createchatmessage
mcp: clickup_send_chat_message
api: POST /v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages
updated: 2026-09-27
---
