---
name: Enrich a person
summary: Returns one person's profile, with job title, employer, work history, education, skills and social profiles, plus work email and phone numbers on paid plans, matched from an email, phone, profile URL, or name and company.
capability: enrich-contacts
docs: https://docs.peopledatalabs.com/docs/reference-person-enrichment-api
api: GET /v5/person/enrich
updated: 2026-09-27
---

Charged per match; a request with no match returns 404. Raise
`min_likelihood` (default 2) for stricter matches, and set `required`, such as
`work_email`, so you are only charged for responses that include the fields
you need. On the free plan, emails, phone numbers and detailed locations come
back as true/false flags. To enrich up to 100 people in one request, use
`POST /v5/person/bulk`.
