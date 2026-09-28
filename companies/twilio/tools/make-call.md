---
name: Make a phone call
summary: Places an outbound call from a Twilio number to a phone number, SIP address or client and runs the TwiML you give it when the call connects.
notes: "`--from` must be a Twilio number or a verified caller ID. Every completed call is charged, including one a voicemail answers."
capability: make-calls
docs: https://www.twilio.com/docs/voice/api/call-resource#create-a-call
cli: twilio api:core:calls:create
updated: 2026-09-27
---
