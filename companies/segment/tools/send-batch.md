---
name: Send a batch of calls
summary: Sends up to 2,500 identify, group, track, page and screen calls to a source in one request.
notes: A request can be up to 500 KB and each call up to 32 KB. A batch of more than 2,500 events still answers 200 but is dropped, so split large imports.
capability: track-events
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#batch
api: POST /v1/batch
updated: 2026-09-27
---
