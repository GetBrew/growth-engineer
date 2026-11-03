---
name: List a company's employees
summary: Returns the people who work at a company, from its LinkedIn URL or name, with name, title, location and profile URL, filtered by job title and place.
notes: Up to 50 companies per run. verifyEmployment, on by default, opens each profile to confirm a current role. Large companies rarely return their full headcount, only what public search shows. Billed per person returned.
capability: find-prospects
docs: https://alphaosint.com/sources/linkedin-company-employees-api/
mcp: johnvc--linkedin-company-employees-api
api: POST /acts/johnvc~linkedin-company-employees-api/run-sync-get-dataset-items
updated: 2026-11-02
---
