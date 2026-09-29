---
name: Outreach
domain: outreach.io
category: sales-engagement
tagline: AI platform for revenue teams to work prospects and accounts, run sequences and forecast deals.
docs: https://developers.outreach.io
logo: https://cdn.growth.engineer/icons/companies/outreach-1c7fa3cd.png
mcp:
  url: https://api.outreach.io/mcp
  auth: oauth
  docs: https://developers.outreach.io/mcp-server
api:
  url: https://api.outreach.io/api/v2
  auth: oauth
  docs: https://developers.outreach.io/api/getting-started
updated: 2026-09-27
---

Outreach is a sales engagement and revenue platform: reps work prospects and
accounts, enroll prospects in multi-step sequences, and track opportunities,
recorded meetings and forecasts. Its hosted MCP server searches, creates and
deletes those records and answers questions about accounts and opportunities,
signing in with OAuth 2.1 as the Outreach user. It needs the Amplify add-on,
an admin must switch it on under Administration > Organization > Org Info, and
create tools are on while delete tools are off until the admin allows them.

The REST API follows JSON:API 1.0: send `Content-Type: application/vnd.api+json`
and a bearer token from an Outreach app's OAuth 2.0 flow. It is rate limited to
10,000 requests per hour per user.
