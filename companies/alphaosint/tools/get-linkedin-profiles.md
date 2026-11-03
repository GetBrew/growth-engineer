---
name: Get LinkedIn profiles
summary: Returns public LinkedIn person profiles as JSON, with name, headline, location, current company, experience, education and follower counts.
notes: Pass profileUrls, up to 1,000 linkedin.com/in/ URLs per run; other URLs are skipped. Billed per profile returned.
capability: enrich-contacts
docs: https://alphaosint.com/sources/linkedin-profile-api/
mcp: johnvc--linkedin-profile-api
api: POST /acts/johnvc~linkedin-profile-api/run-sync-get-dataset-items
updated: 2026-11-02
---
