---
name: Associate a user with a group
summary: Ties an identified user to a group, such as a company or account, and records the group's traits like industry and employee count.
capability: track-product-usage
docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api#group
api: POST /v1/group
updated: 2026-09-27
---

Send `userId` or `anonymousId`, the `groupId`, and the group's `traits`.
Destinations that model accounts, such as Intercom, use it to tie users to
their company. `SEGMENT_API_KEY` holds the base64 of the source's write key
followed by a colon.
