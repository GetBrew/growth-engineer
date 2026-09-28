---
name: Trigger a broadcast
summary: Sends an API-triggered broadcast now or at a scheduled time, to its saved audience or to the people, emails or filter you pass, with data for its Liquid placeholders.
notes: Set the broadcast up in Customer.io first. Unknown recipients fail the request unless you set `email_ignore_missing` or `id_ignore_missing` to `true`, and the endpoint allows one request every 10 seconds.
capability: send-email
docs: https://docs.customer.io/integrations/api/app/tag/send-messages/triggerBroadcast/
api: POST /v1/campaigns/{broadcast_id}/triggers
updated: 2026-09-27
---
