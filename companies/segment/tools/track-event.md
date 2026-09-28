---
name: Track an event
summary: Records one action a user took, such as Signed Up, with its properties and routes it to the source's destinations.
notes: A request can be up to 32 KB. Segment deduplicates on `messageId`, so give every event a unique one under 100 characters.
capability: track-events
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#track
api: POST /v1/track
updated: 2026-09-27
---
