---
name: Track an event
summary: Records one action a user took, such as Signed Up, with its properties and routes it to the source's destinations.
capability: track-product-usage
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#track
api: POST /v1/track
updated: 2026-09-27
---

Send `event`, `userId` or `anonymousId`, and optional `properties`; a request
can be up to 32 KB. Segment deduplicates on `messageId`, so give every event a
unique one under 100 characters. `SEGMENT_API_KEY` holds the base64 of the
source's write key followed by a colon.
