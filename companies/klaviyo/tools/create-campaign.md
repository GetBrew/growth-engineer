---
name: Create a campaign
summary: Creates a campaign for the lists and segments you include, with its messages and send strategy, and returns it.
capability: send-email
docs: https://developers.klaviyo.com/en/reference/create_campaign
mcp: create_campaign
cli: klaviyo campaigns create
api: POST /api/campaigns
updated: 2026-09-27
---

`name`, `audiences.included` and the `campaign-messages` are required; the
send strategy defaults to immediate. Give an email message its content by
assigning a template to it (`assign_template_to_campaign_message`).
