---
name: List a broadcast's clicked links
summary: Returns the links people clicked in a broadcast, most clicked first, with total clicks and the number of people who clicked each.
notes: Only clicked links are listed, most clicked first. Rank by `unique_clicks`, since mail security scanners inflate `clicks`. The unsubscribe link is listed too, with a per-person token in its URL; leave it out of reports. The CLI shows 10 per page by default and the API 20.
capability: track-email-engagement
docs: https://resend.com/docs/api-reference/broadcasts/list-broadcast-clicked-links
mcp: list-broadcast-clicked-links
cli: resend broadcasts clicked-links
api: GET /broadcasts/{broadcast_id}/clicked-links
updated: 2026-09-30
---
