---
name: Send a batch of calls
summary: Sends up to 2,500 identify, group, track, page and screen calls to a source in one request.
capability: track-product-usage
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#batch
api: POST /v1/batch
updated: 2026-09-27
---

Put each call in `batch[]` with its `type`. A request can be up to 500 KB and
each call up to 32 KB. Segment still answers 200 but drops the events when a
batch holds more than 2,500 of them, so split large imports. `SEGMENT_API_KEY`
holds the base64 of the source's write key followed by a colon.
