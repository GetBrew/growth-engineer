---
name: Get a LinkedIn profile from Fetchin
summary: Returns Fetchin's own answer for one LinkedIn profile URL, fetched live, plus datacircle_meta with the call's cost and the balance left.
notes: "$1.485 per 1,000 through Fetchin, a profile it can't find billed the same. Fetchin has no daily limit either. Send X-Data-Provider: fetchin; only profileUrlOrUrn, a full profile URL, is passed on. A profile it can't find answers 404 ($0.001485). On MCP, set provider to fetchin."
capability: get-linkedin-profiles
docs: https://docs.datacircle.dev/api-reference/fetchin/get-one-linkedin-profile
mcp: get_linkedin_profile
api: GET /api/v1/profile
updated: 2026-10-10
---
