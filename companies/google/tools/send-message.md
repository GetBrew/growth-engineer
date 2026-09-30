---
name: Send an email
summary: Sends an email message from the user's Gmail account, either new or as a reply in an existing thread.
notes: Needs the `gmail.send` OAuth scope; the message is a base64url-encoded RFC 2822 MIME message, not exposed by the MCP server's tools.
capability: send-email
docs: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
api: POST /gmail/v1/users/{userId}/messages/send
updated: 2026-09-29
---
