---
name: Search for people
summary: Returns up to 1,000 people in a workspace who match a filter on segment membership and attribute values.
capability: build-audience
docs: https://docs.customer.io/integrations/api/app/tag/customers/getPeopleFilter/
api: POST /v1/customers
updated: 2026-09-27
---

Combine conditions with `and`, `or` and `not`; an attribute condition matches
a value (`eq`) or the attribute's presence (`exists`). Read the `identifiers`
array in the response. For larger sets, export the people instead
(`POST /v1/exports/customers`).
