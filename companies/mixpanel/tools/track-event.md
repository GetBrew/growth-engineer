---
name: Track an event
summary: Records one event, with its properties, in a Mixpanel project.
capability: track-product-usage
docs: https://docs.mixpanel.com/reference/track-event
status: draft
updated: 2026-09-26
---

Events go to the ingestion host (`POST https://api.mixpanel.com/track`) with the project token in each event, not to the Query API host and service account this company declares, so the call can't be written as a path on it yet.
