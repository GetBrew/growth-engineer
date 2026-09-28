---
name: Look up a phone number
summary: Validates a phone number and returns it in E.164 and national formats, plus line type, caller name or other data you request.
notes: Pass the number in E.164 format. The basic lookup is free; data packages added with `--fields`, such as `line_type_intelligence` or `caller_name` (US only), are paid, and some need Twilio's approval first.
capability: enrich-contacts
docs: https://www.twilio.com/docs/lookup/v2-api#making-a-request
cli: twilio api:lookups:v2:phone-numbers:fetch
updated: 2026-09-27
---
