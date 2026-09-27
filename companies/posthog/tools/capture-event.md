---
name: Capture an event
summary: Records one event, with its distinct ID and properties, in a PostHog project.
capability: track-product-usage
docs: https://posthog.com/docs/api/capture
status: draft
updated: 2026-09-26
---

Capture is a public endpoint on the ingestion host (`POST https://us.i.posthog.com/i/v0/e/`) that takes the project token in the request body, while this company's API way is the private host with a personal API key, so the call can't be written as a path on it yet.
