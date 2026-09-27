---
name: Look up a phone number
summary: Validates a phone number and returns it in E.164 and national formats, plus line type, caller name or other data you request.
capability: enrich-contacts
docs: https://www.twilio.com/docs/lookup/v2-api#making-a-request
cli: twilio api:lookups:v2:phone-numbers:fetch
updated: 2026-09-27
---

Pass `--phone-number` in E.164 format. The basic lookup (formatting and
validation) is free; add paid data packages with `--fields`, such as
`line_type_intelligence` (mobile, landline, VoIP and more) or `caller_name`
(US numbers only). Some packages need Twilio's approval first. The REST call
is `GET https://lookups.twilio.com/v2/PhoneNumbers/{PhoneNumber}`. The CLI
also needs `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, or a `twilio login`
profile.
