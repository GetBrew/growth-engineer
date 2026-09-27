---
name: Send a transactional email
summary: Sends one transactional email to a person, from a template filled with your message data or from a subject, body and sender you pass, creating the person if needed.
capability: send-email
docs: https://docs.customer.io/integrations/api/app/tag/send-messages/sendEmail/
cli: cio send email
api: POST /v1/send/email
updated: 2026-09-27
---

Pass `to`, the person's `identifiers` (one of `id`, `email` or `cio_id`) and a
`transactional_message_id`, the template's ID or trigger name, so metrics roll
up per message; `message_data` fills the template's Liquid. The CLI sends with
a service-account token and needs `--environment-id`, the workspace ID;
production code should send with an App API key.
