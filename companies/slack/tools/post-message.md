---
name: Post a message
summary: Posts a message to a channel, DM or thread and returns the channel ID and the message timestamp.
capability: route-alerts
docs: https://docs.slack.dev/reference/methods/chat.postMessage
mcp: slack_send_message
cli: slack api chat.postMessage
api: POST /chat.postMessage
aliases:
  - slack/route-alerts
updated: 2026-09-26
---

Needs the `chat:write` scope. Pass `thread_ts` to reply in a thread. Over MCP, `slack_send_message` posts as the signed-in user; the API and CLI post as the app's bot.
