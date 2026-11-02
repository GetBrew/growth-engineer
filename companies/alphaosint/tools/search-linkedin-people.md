---
name: Search LinkedIn people
summary: Finds people on LinkedIn by name, job title, company, school or location, and returns each public profile's URL, headline, employer, work history and education.
notes: Pass a name (firstName, lastName) or keywords; narrow with jobTitle, company, school or location. Results come ten at a time, so maxResults below 10 counts as 10. With enrichProfiles false, a faster run returns only URL, name, headline and employer. Billed per person returned.
capability: find-prospects
docs: https://alphaosint.com/sources/linkedin-people-search-api/
mcp: johnvc--linkedin-people-search-api
api: POST /acts/johnvc~linkedin-people-search-api/run-sync-get-dataset-items
updated: 2026-11-02
---
