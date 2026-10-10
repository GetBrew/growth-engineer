---
name: Get a LinkedIn profile from Fetchin
summary: Returns Fetchin's own answer for one LinkedIn profile URL, fetched live, plus datacircle_meta with the call's cost and the balance left.
notes: "$1.485 per 1,000, found or not (not found answers 404). No daily limit, but 5 requests a second across all customers (then 429, free). Send X-Data-Provider: fetchin; only profileUrlOrUrn, a full profile URL, is passed on. On MCP, set provider to fetchin."
capability: enrich-contacts
docs: https://docs.datacircle.dev/api-reference/fetchin/get-one-linkedin-profile
mcp: get_linkedin_profile
api: GET /api/v1/profile
updated: 2026-10-10
---
