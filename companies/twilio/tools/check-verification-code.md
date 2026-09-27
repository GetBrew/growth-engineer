---
name: Check a verification code
summary: Checks the code a user entered against their pending verification and returns its status, approved when the code is right.
capability: authenticate-users
docs: https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
cli: twilio api:verify:v2:services:verification-check:create
updated: 2026-09-27
---

Pass `--service-sid`, the same `--to` the code was sent to, and `--code`. A
verification expires after 10 minutes and is deleted once it is approved or
runs out of attempts; checking it after that returns 404. The REST call is
`POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck`.
The CLI also needs `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, or a
`twilio login` profile.
