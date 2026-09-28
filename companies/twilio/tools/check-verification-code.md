---
name: Check a verification code
summary: Checks the code a user entered against their pending verification and returns its status, approved when the code is right.
notes: Pass the same `--to` the code was sent to. A verification expires after 10 minutes and is deleted once approved or out of attempts; checking it after that returns 404.
capability: authenticate-users
docs: https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
cli: twilio api:verify:v2:services:verification-check:create
updated: 2026-09-27
---
