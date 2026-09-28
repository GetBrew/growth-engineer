---
name: Identify a user
summary: Records a user's traits, such as email, name and plan, against their user ID and routes them to the source's destinations.
notes: Answers 200 even for an event it drops (only oversized payloads and invalid JSON return 400), so confirm arrival in the source's Debugger.
capability: track-events
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#identify
api: POST /v1/identify
updated: 2026-09-27
---
