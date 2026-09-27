---
name: Send an email from the inbox
summary: Sends one email to a lemlist contact or lead from a connected mailbox, as a new message or as a reply in their latest thread.
capability: send-email
docs: https://developer.lemlist.com/api-reference/endpoints/inbox/send-email
cli: lemlist api POST /inbox/email
api: POST /inbox/email
updated: 2026-09-27
---

Pass the sender's `sendUserId`, `sendUserEmail` and `sendUserMailboxId`, the
recipient's `contactId` or `leadId`, a `subject` and an HTML `message`. Set
`replyToActivityId` to an email activity id (`act_...`), or to `latest`, to
reply in the thread and reuse its subject. This sends a real email, so
confirm the recipient and text first.
