---
name: Create a campaign
summary: Creates an unsent campaign for one audience, or a segment of it, with its subject line, sender and settings.
capability: send-email
docs: https://mailchimp.com/developer/marketing/api/campaigns/add-campaign/
api: POST /campaigns
updated: 2026-09-27
---

Set `type` (such as `regular`), `recipients.list_id` and, to narrow the
audience, `recipients.segment_opts`; `settings` holds the subject line, from
name and reply-to address. Add the content with
`PUT /campaigns/{campaign_id}/content` before sending.
