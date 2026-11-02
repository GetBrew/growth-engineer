---
name: Get Crunchbase companies
summary: Returns Crunchbase company data as JSON, with funding, investors, industries, headquarters, employee count, rank and status.
notes: Pass companyUrls (crunchbase.com/organization/ URLs) or companyNames (a name or website domain, resolved to the top match), up to 100 of each per run. Billed per company.
capability: enrich-companies
docs: https://alphaosint.com/sources/crunchbase-company-api/
mcp: johnvc--crunchbase-company-api
api: POST /acts/johnvc~crunchbase-company-api/run-sync-get-dataset-items
updated: 2026-11-02
---
