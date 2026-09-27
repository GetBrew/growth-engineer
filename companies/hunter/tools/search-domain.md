---
name: Search a domain for emails
summary: Returns the email addresses Hunter has found for a company domain, with each person's name, position, seniority, department and a confidence score.
capability: find-work-emails
docs: https://hunter.io/api-documentation/v2#domain-search
mcp: Domain-Search
api: GET /domain-search
updated: 2026-09-27
---

Pass a `domain` (or a `company` name). Narrow the results with `department`,
`seniority`, `type` (`personal` or `generic`) or `decision_maker`, and page
through them with `limit` (10 by default) and `offset`. The response also
includes the domain's email `pattern` and whether it accepts all addresses
(`accept_all`).
