---
name: Query product analytics
summary: Runs an ad-hoc event segmentation, funnel or retention query, or queries a saved chart by id, and returns the results.
capability: track-product-usage
docs: https://amplitude.com/docs/amplitude-ai/amplitude-mcp
mcp: query_amplitude_data
aliases:
  - amplitude/track-product-usage
updated: 2026-09-26
---

Call `get_amplitude_context` with the project id first, so the query uses the
project's time zone and metric definitions. The tool works in two modes:
discover what can be queried, then execute the query.
