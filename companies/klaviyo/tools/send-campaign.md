---
name: Send a campaign
summary: Starts an asynchronous job that sends a campaign to its configured audience.
capability: send-email
docs: https://developers.klaviyo.com/en/reference/send_campaign
mcp: send_campaign
cli: klaviyo campaigns send-campaign
api: POST /api/campaign-send-jobs
updated: 2026-09-27
---

Check progress with Get Campaign Send Job (`get_campaign_send_job`), and stop
a send with Cancel Campaign Send (`cancel_campaign_send`). Confirm the
campaign, its audience and its content with the user before sending.
