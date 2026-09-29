---
name: Twilio
domain: twilio.com
category: messaging
tagline: APIs for SMS, RCS, voice and email, plus phone number lookup and identity verification.
docs: https://www.twilio.com/docs
github: https://github.com/twilio
logo: https://cdn.growth.engineer/icons/companies/twilio-7581560d.png
cli:
  install: brew tap twilio/brew && brew install twilio
  binary: twilio
  auth: api_key
  env: TWILIO_API_KEY
  keyUrl: https://www.twilio.com/docs/iam/api-keys/keys-in-console
  docs: https://www.twilio.com/docs/twilio-cli
  notes: Also set `TWILIO_ACCOUNT_SID` and `TWILIO_API_SECRET`, with `TWILIO_API_KEY` holding the API key SID, or sign in once with `twilio login`.
updated: 2026-09-27
---

Twilio provides APIs to send SMS, MMS and WhatsApp messages, place voice
calls, look up phone numbers and verify users with one-time codes. The
`twilio` CLI reaches every Twilio REST API through `twilio api:...` commands.
It reads credentials from `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY` (an API key
SID) and `TWILIO_API_SECRET`, or from a profile that `twilio login` saves.
Twilio also documents apt, Scoop, Docker and npm installs of the CLI.

The REST APIs behind those commands live on several hosts, such as
`https://api.twilio.com` for messages and calls, `https://verify.twilio.com`
and `https://lookups.twilio.com`, and take HTTP Basic auth with an API key SID
as the username and its secret as the password; each tool names its REST call.
Twilio's hosted MCP server at `https://mcp.twilio.com/docs` searches Twilio's
API specs and docs but does not make calls.
