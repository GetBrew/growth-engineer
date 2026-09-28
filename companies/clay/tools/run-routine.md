---
name: Run a routine
summary: Runs a Clay-managed function such as Work Email or Company Domain, or a team's own function, on 1 to 100 records and returns a run id to poll for results.
notes: List routines first for the id and input schema; the managed Work Email routine needs a full name, company name and company domain. Poll `GET /routines/run/{routine_run_id}/results` until the run is complete.
capability: enrich-contacts
docs: https://developers.clay.com/api-reference/routines/execute-a-routine-against-1-100-items
cli: clay routines runs start
api: POST /routines/{routine_id}/run
aliases:
  - clay/enrich-contacts
  - clay/find-work-emails
updated: 2026-09-26
---
