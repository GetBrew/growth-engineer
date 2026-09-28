---
name: Send a campaign
summary: Starts an asynchronous job that sends a campaign to its configured audience.
notes: "Sends to real people: confirm the campaign, its audience and its content with the user first. Track the job with `get_campaign_send_job` and stop it with `cancel_campaign_send`."
capability: send-email
docs: https://developers.klaviyo.com/en/reference/send_campaign
mcp: send_campaign
cli: klaviyo campaigns send-campaign
api: POST /api/campaign-send-jobs
updated: 2026-09-27
---
