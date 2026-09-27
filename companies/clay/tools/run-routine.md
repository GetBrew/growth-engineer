---
name: Run a routine
summary: Runs a Clay-managed function such as Work Email or Company Domain, or a team's own function, on 1 to 100 records and returns a run id to poll for results.
capability: enrich-contacts
docs: https://developers.clay.com/api-reference/routines/execute-a-routine-against-1-100-items
cli: clay routines runs start
api: POST /routines/{routine_id}/run
aliases:
  - clay/enrich-contacts
  - clay/find-work-emails
updated: 2026-09-26
---

Clay-managed functions cover work email, phone, job title, company domain,
employee count, tech stack, funding and job openings. List routines to find
the id and input schema before running: the managed Work Email routine needs
a full name, company name and company domain. Poll
`GET /routines/run/{routine_run_id}/results` until the run is complete.
