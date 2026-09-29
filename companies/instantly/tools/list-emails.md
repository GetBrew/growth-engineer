---
name: List emails
summary: Returns the emails in the workspace's Unibox, newest first, filtered by campaign, lead, read status or type, such as only the replies received.
notes: "Pass `email_type=received` for replies, and `campaign_id` or `is_unread=true` to narrow them. Pages with `limit` and the previous response's `next_starting_after`."
capability: search-conversations
docs: https://developer.instantly.ai/api-reference/email/list-email
api: GET /api/v2/emails
updated: 2026-09-29
---
