---
name: Search people
summary: Returns Salesloft people, the contacts and leads a team works, that match filters such as email address, name, company, title, account or cadence.
capability: manage-crm
docs: https://developers.salesloft.com/docs/api/people-index/
mcp: search_people
api: GET /v2/people
updated: 2026-09-27
---

Over the API, filters are query parameters such as `email_addresses`,
`title`, `account_id` and `cadence_id`, and `can_email=true` keeps only people
who can be emailed. The MCP tool returns each person's id, name, email and job
title; `person_by_id` (or `GET /v2/people/:id`) returns the full record.
