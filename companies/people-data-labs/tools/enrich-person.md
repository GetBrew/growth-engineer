---
name: Enrich a person
summary: Returns one person's profile, with job title, employer, work history, education, skills and social profiles, plus work email and phone numbers on paid plans, matched from an email, phone, profile URL, or name and company.
notes: Charged per match; no match returns 404. Set `required`, such as `work_email`, to be charged only for matches with the fields you need. On the free plan, emails, phone numbers and detailed locations come back as true/false flags.
capability: enrich-contacts
docs: https://docs.peopledatalabs.com/docs/reference-person-enrichment-api
api: GET /v5/person/enrich
updated: 2026-09-27
---
