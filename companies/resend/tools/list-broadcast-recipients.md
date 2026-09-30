---
name: List a broadcast's recipients
summary: Returns the people a broadcast reached for one event, such as everyone who opened, clicked, bounced or unsubscribed, with their contact ID and, for clicks, the links they clicked.
notes: Pass one `type` per call; a row's `id` is a page cursor. Mail security scanners can click every link, unsubscribe included, so treat a recipient who clicked all of them as a likely bot. Before emailing this list, skip unsubscribed, complained, suppressed and bounced addresses.
capability: track-email-engagement
docs: https://resend.com/docs/api-reference/broadcasts/list-broadcast-recipients
mcp: list-broadcast-recipients
cli: resend broadcasts recipients
api: GET /broadcasts/{broadcast_id}/recipients
updated: 2026-09-30
---
