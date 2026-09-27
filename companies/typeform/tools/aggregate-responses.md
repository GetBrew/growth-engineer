---
name: Aggregate responses
summary: Returns counts, averages, sums or NPS for one field of a form's responses or for all of them.
capability: collect-responses
docs: https://www.typeform.com/developers/mcp/tools/
mcp: insights-public_aggregate
updated: 2026-09-27
---

Call `insights-public_discover` first: it returns the form's queryable
fields and measures, and field IDs differ per form. Filters cover answers,
hidden fields, tags and response type. For rankings use
`insights-public_toplist`; for trends over time, `insights-public_timeseries`.
