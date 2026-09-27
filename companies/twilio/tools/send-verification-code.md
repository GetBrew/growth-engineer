---
name: Send a verification code
summary: Starts verifying a phone number or email address by sending a one-time code over SMS, WhatsApp, a voice call or email.
capability: authenticate-users
docs: https://www.twilio.com/docs/verify/api/verification#start-new-verification
cli: twilio api:verify:v2:services:verifications:create
updated: 2026-09-27
---

Create a Verify Service first, then pass its SID (`VA...`) as `--service-sid`,
the `--to` number in E.164 format or email address, and `--channel` (`sms`,
`whatsapp`, `call`, `email`, `sna` or `auto`). Check the code the user enters
with `twilio api:verify:v2:services:verification-check:create`. The REST call
is `POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications`.
The CLI also needs `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, or a
`twilio login` profile.
