---
name: Reply to an email
summary: Sends a reply to an email in an Instantly inbox from one of the workspace's connected sending accounts.
capability: send-email
docs: https://developer.instantly.ai/api-reference/email/reply-to-an-email
api: POST /api/v2/emails/reply
updated: 2026-09-27
---

Pass `reply_to_uuid` (the `id` of the email, from the email endpoints), the
sending account as `eaccount`, a `subject`, and a `body` with `html`, `text`
or both. It only replies to an existing email; it can't start a new thread.
This sends a real email, so confirm the text first.
