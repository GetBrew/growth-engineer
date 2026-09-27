---
name: Create a segment
summary: Creates a segment of the contacts that match an SQL-style query, optionally within one list, that updates as contacts change.
capability: build-audience
docs: https://www.twilio.com/docs/sendgrid/api-reference/segmenting-contacts-v2/create-segment
api: POST /v3/marketing/segments/2.0
updated: 2026-09-27
---

Pass a unique `name` and the `query_dsl`; `parent_list_ids` limits the
segment to one list. Segment counts refresh every 1 to 24 hours, and a
segment built on engagement data takes about 30 minutes to start filling.
