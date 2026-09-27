---
name: Send a campaign
summary: Sends a campaign to its recipients right away; an RSS campaign sends on its schedule instead.
capability: send-email
docs: https://mailchimp.com/developer/marketing/api/campaigns/send-campaign/
api: POST /campaigns/{campaign_id}/actions/send
updated: 2026-09-27
---

Review `GET /campaigns/{campaign_id}/send-checklist` first and resolve what
it lists; `POST /campaigns/{campaign_id}/actions/test` sends a test email.
Confirm the campaign and its audience with the user before sending.
