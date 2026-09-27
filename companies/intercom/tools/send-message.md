---
name: Send a message
summary: Sends an email, in-app or WhatsApp message from a teammate to a user or lead and returns the created message.
capability: send-email
docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io/messages/createmessage
api: POST /messages
updated: 2026-09-27
---

For an email, pass `message_type: email`, `subject`, `body`, `template`
(`plain` or `personal`), `from` (`type: admin` and the teammate's `id`) and
`to` (the contact's `type` and `id`). No conversation exists until the contact
replies. A contact created moments earlier can return 404 until it is ready to
be messaged.
