---
name: Send a message
summary: Sends an SMS, MMS or WhatsApp message from a Twilio sender to one recipient and returns the new Message resource.
capability: send-sms
docs: https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource
cli: twilio api:core:messages:create
updated: 2026-09-27
---

Pass `--to` in E.164 format (or a channel address such as
`whatsapp:+15552229999`), a sender with `--from` or `--messaging-service-sid`,
and `--body`. A body over 160 GSM-7 characters is split into segments, each
charged, and trial accounts can only send to verified numbers. The REST call
is `POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`.
The CLI also needs `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, or a
`twilio login` profile.
