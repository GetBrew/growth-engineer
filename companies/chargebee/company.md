---
name: Chargebee
domain: chargebee.com
category: payments
tagline: Subscription billing and revenue management, from hosted checkout to invoices and revenue data.
docs: https://www.chargebee.com/docs
github: https://github.com/chargebee
logo: chargebee.png
mcp:
  url: https://{YOUR-CHARGEBEE-SUBDOMAIN}.mcp.chargebee.com/data_lookup_agent
  auth: oauth
  docs: https://www.chargebee.com/docs/billing/2.0/ai-in-chargebee/data-lookup-agent
api:
  url: https://{site}.chargebee.com/api/v2
  auth: api_key
  env: CHARGEBEE_API_KEY
  header: "Authorization: Basic"
  docs: https://apidocs.chargebee.com/docs/api
updated: 2026-09-27
---

Chargebee is a billing and revenue management platform: it meters usage, runs
subscriptions, turns them into invoices and payments, and recognizes revenue
on one commercial record. `{site}` and `{YOUR-CHARGEBEE-SUBDOMAIN}` are your
Chargebee site name, such as `acme-test`.

The REST API uses HTTP Basic auth with the API key as the username and an empty
password, takes form-encoded parameters and returns JSON. Create a key under
Settings > Configure Chargebee > API Keys and Webhooks; test and live sites
have different keys. The Data Lookup MCP server reads customers,
subscriptions, invoices, quotes and payments. Turn on its MCP access and create
an OAuth client ID for your MCP client under Settings > Configure Chargebee >
Agentic AI > MCP Servers; sites with Multi-Business Entity enabled can't use
OAuth. Sites in the EU and AU data centers use `mcp.eu.chargebee.com` and
`mcp.au.chargebee.com` in place of `mcp.chargebee.com`.

The MCP server's docs list its tools by label, not by name, so the tools
below name only their API calls; the server lists its own once connected.
