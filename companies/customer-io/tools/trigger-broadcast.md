---
name: Trigger a broadcast
summary: Sends an API-triggered broadcast now or at a scheduled time, to its saved audience or to the people, emails or filter you pass, with data for its Liquid placeholders.
capability: send-email
docs: https://docs.customer.io/integrations/api/app/tag/send-messages/triggerBroadcast/
api: POST /v1/campaigns/{broadcast_id}/triggers
updated: 2026-09-27
---

Set the broadcast up in Customer.io first. It reaches only people already in
the workspace: unknown recipients fail the request unless you set
`email_ignore_missing` or `id_ignore_missing` to `true`. Reference `data` in
the message as `{{trigger.<key>}}`. This endpoint allows one request every 10
seconds.
