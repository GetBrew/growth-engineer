---
name: Send an email
summary: Sends an email from a verified sender, with up to 1,000 personalizations that each set their own recipients.
capability: send-email
docs: https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send
cli: twilio email:send
api: POST /v3/mail/send
updated: 2026-09-27
---

Each object in `personalizations` is one envelope: its recipients and how
their message is handled. On the CLI, `twilio email:set` saves a default
sender and subject, and `twilio email:send` takes `--to`, `--text`,
`--subject`, `--from` and `--attachment`.
