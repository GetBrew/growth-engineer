---
name: Track an event
summary: Records an event with its properties for one person, which can trigger event-based automations.
capability: track-product-usage
docs: https://docs.customer.io/integrations/api/track/tag/track-events/track/
status: draft
updated: 2026-09-27
---

Events go to the Track API (`POST /api/v1/customers/{identifier}/events` on
`https://track.customer.io`), which authenticates with Basic auth from a site
ID and API key, not the App API and bearer key this company declares, so the
call can't be written as a path on it yet.
