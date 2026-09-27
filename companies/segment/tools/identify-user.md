---
name: Identify a user
summary: Records a user's traits, such as email, name and plan, against their user ID and routes them to the source's destinations.
capability: track-product-usage
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#identify
api: POST /v1/identify
updated: 2026-09-27
---

Send `userId` or `anonymousId` and a `traits` object. Segment recommends
identifying once when the account is created and again only when its traits
change. `SEGMENT_API_KEY` holds the base64 of the source's write key followed
by a colon. The API answers 200 even for an event it drops (only oversized
payloads and invalid JSON return 400), so confirm arrival in the source's
Debugger.
