---
name: Monitor the web for new results
summary: Creates a monitor that reruns an Exa search on a schedule and sends only new, deduplicated results to your webhook.
notes: "Store the `webhookSecret` from the response: it is returned only once and verifies webhook signatures. Each run only fetches content from after the previous run, so write the query around the ongoing signal, not a date range."
capability: track-intent
docs: https://exa.ai/docs/reference/monitors/create-a-monitor
api: POST /monitors
updated: 2026-09-27
---
