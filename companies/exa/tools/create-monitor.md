---
name: Monitor the web for new results
summary: Creates a monitor that reruns an Exa search on a schedule and sends only new, deduplicated results to your webhook.
capability: track-intent
docs: https://exa.ai/docs/reference/monitors/create-a-monitor
api: POST /monitors
updated: 2026-09-27
---

Use it to follow signals such as funding rounds, competitor announcements or
news. Write the query around the ongoing signal rather than a date range:
each run only fetches content from after the previous run. Store the
`webhookSecret` from the response, which is returned only once and verifies
webhook signatures.
