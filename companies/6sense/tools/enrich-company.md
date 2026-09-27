---
name: Enrich a company
summary: Returns a company's firmographics, such as industry, employee and revenue range, address and SIC and NAICS codes, plus its 6sense segments, found from an email or a domain.
capability: research-accounts
docs: https://api.6sense.com/docs/#company-firmographics-api-v3
api: POST /v1/enrichment/company
updated: 2026-09-27
---

Send a form-encoded `email` or `domain`; when both are given, the email is
matched first. Add `country` to get the company's `companyId` back. Each
enriched record costs one 6sense Credit, and the API needs the 6sense
Platform or Sales Intelligence package. Segment names appear only when they
are turned on in API Settings.
