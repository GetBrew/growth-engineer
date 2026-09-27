---
name: Create an audience
summary: Creates an Engage audience in a space from a query-language definition of the users or accounts to include.
capability: build-audience
docs: https://docs.segmentapis.com/tag/Audiences/#operation/createAudience
status: draft
updated: 2026-09-27
---

The call is `POST /spaces/{spaceId}/audiences` on the Public API
(`https://api.segmentapis.com`, with a Public API token sent as a Bearer
token), not on the Tracking API host and write key this company declares, so
it can't be written as a call here yet. The workspace needs the Audience
feature enabled, and the endpoint allows 50 requests per minute.
