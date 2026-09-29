---
name: Gong
domain: gong.io
category: revenue-intelligence
tagline: Revenue AI that turns the calls and emails your team has with customers into account and deal insights.
docs: https://help.gong.io
logo: https://cdn.growth.engineer/icons/companies/gong-68520f07.svg
mcp:
  url: https://mcp.gong.io/mcp
  auth: oauth
  docs: https://help.gong.io/docs/about-gong-mcp-server
  notes: A Gong tech admin registers the MCP integration first. It is read-only, and every answer spends Gong credits.
api:
  url: https://{company}.api.gong.io
  auth: api_key
  env: GONG_API_KEY
  scheme: Basic
  keyUrl: https://app.gong.io/company/api
  docs: https://help.gong.io/apidocs/introduction-2
  notes: "`{company}` is your API host prefix from Gong's API settings, as in `company-17.api.gong.io`. `GONG_API_KEY` holds the base64 of `<access key>:<secret>`; 3 calls a second, 10,000 a day."
updated: 2026-09-27
---

Gong records and analyzes the calls and emails a revenue team has with
customers, ties them to the accounts, deals, contacts and leads in the CRM,
and runs Gong Engage flows for outreach.

The hosted MCP server is read-only: it answers questions about accounts and
deals and writes briefs from their calls and emails, and never returns raw
transcripts or email bodies. A Gong tech admin must first register an MCP
server integration under Admin center, Settings, Ecosystem, MCP. With
automatic registration, people connect by signing in to Gong; a manual
integration issues a client ID and secret for the one client allowed to
connect. Connecting needs a paid Gong seat, and every answer consumes Gong
credits.

The API host differs per company: Gong's API settings show it, and OAuth
returns it as `api_base_url_for_customer` (the docs' example is
`https://company-17.api.gong.io`). A tech admin creates an access key and
secret on the Gong API page; `GONG_API_KEY` holds the base64 of
`<access key>:<access key secret>`. By default a company can make 3 API calls
per second and 10,000 per day.
