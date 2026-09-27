---
name: Make a phone call
summary: Places an outbound call from a Twilio number to a phone number, SIP address or client and runs the TwiML you give it when the call connects.
capability: make-calls
docs: https://www.twilio.com/docs/voice/api/call-resource#create-a-call
cli: twilio api:core:calls:create
updated: 2026-09-27
---

Pass `--to`, `--from` (a Twilio number or a verified caller ID) and the call's
instructions as `--twiml` or as a `--url` that returns TwiML. Every completed
call is charged, including one a voicemail answers. The REST call is
`POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json`. The
CLI also needs `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, or a
`twilio login` profile.
