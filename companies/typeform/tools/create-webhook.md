---
name: Send responses to a webhook
summary: Creates or updates a named webhook that posts each new response to a form to your URL.
capability: collect-responses
docs: https://www.typeform.com/developers/webhooks/reference/create-or-update-webhook/
api: PUT /forms/{form_id}/webhooks/{tag}
updated: 2026-09-27
---

Name the webhook with `tag`, set `url` and `enabled: true`, and pass a
`secret` so each payload is signed with HMAC SHA-256 and can be verified.
Use `event_types`, such as `form_response_partial`, to choose the events it
receives. The MCP server doesn't manage form-level webhooks; over MCP, add a
webhook step to an automation with `automations-public_add_webhook_step`.
