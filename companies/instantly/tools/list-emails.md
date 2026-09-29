---
name: List emails
summary: Returns the emails in the workspace's Unibox, newest first, filtered by campaign, read status or type, such as only the replies received, or searched by a lead's email address.
notes: "Pass `email_type=received` for replies, and `campaign_id` or `is_unread=true` to narrow them. Page with `limit` and `starting_after`, set to the previous response's `next_starting_after`."
capability: search-conversations
docs: https://developer.instantly.ai/api-reference/email/list-email
api: GET /api/v2/emails
updated: 2026-09-29
---
