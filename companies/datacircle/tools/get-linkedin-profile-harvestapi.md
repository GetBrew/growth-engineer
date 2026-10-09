---
name: Get a LinkedIn profile from HarvestAPI
summary: Returns HarvestAPI's own answer for one LinkedIn profile URL, fetched live, plus datacircle_meta with the call's cost and the balance left.
notes: "$3.70 per 1,000, no daily limit. Send X-Data-Provider: harvestapi; only url is passed on. A profile it can't find still answers 200, with element null, and is billed ($0.0023). On MCP, set provider to harvestapi."
capability: enrich-contacts
docs: https://docs.datacircle.dev/api-reference/harvestapi/get-one-linkedin-profile
mcp: get_linkedin_profile
api: GET /linkedin/profile
updated: 2026-10-10
---
