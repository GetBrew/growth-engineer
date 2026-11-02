---
name: Get LinkedIn company pages
summary: Returns public LinkedIn company pages as JSON, with industry, size, headquarters, followers, specialties and locations.
notes: Pass companyUrls (up to 1,000 linkedin.com/company/ URLs) or companyNames (up to 500), each matched to its company page first. A name that matches nothing returns an error row and is not charged. Billed per company, plus a search event per name matched.
capability: enrich-companies
docs: https://alphaosint.com/sources/linkedin-company-api/
mcp: johnvc--linkedin-company-api
api: POST /acts/johnvc~linkedin-company-api/run-sync-get-dataset-items
updated: 2026-11-02
---
