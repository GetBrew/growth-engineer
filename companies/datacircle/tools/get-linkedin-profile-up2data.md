---
name: Get a LinkedIn profile from Up2Data
summary: Returns Up2Data's own answer for one LinkedIn profile URL, fetched live, plus datacircle_meta with the call's cost and the balance left.
notes: "$2.375 per 1,000; a profile Up2Data can't find is free (422). Send X-Data-Provider: up2data. Up2Data takes $1 a day per account (421 profiles), with a shared daily limit for all customers, then answers 429 until 00:00 UTC. On MCP, provider defaults to up2data."
capability: get-linkedin-profiles
docs: https://docs.datacircle.dev/api-reference/up2data/enrich-one-linkedin-profile
mcp: get_linkedin_profile
api: POST /v1/profiles/enrich
updated: 2026-10-10
---
