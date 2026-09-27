---
name: Create an audience segment
summary: Saves a named segment of the contacts that match an audience filter, for targeting campaigns and filtering workflows.
capability: build-audience
docs: https://loops.so/docs/api-reference/create-audience-segment
mcp: execute
cli: loops audience-segments create
api: POST /v1/audience-segments
updated: 2026-09-27
---

The filter matches `all` or `any` of its conditions, such as a contact
property equal to a value. Target a campaign at the segment with its ID. On
the MCP server, `search`, `describe` and `execute` find, inspect and run this
operation.
