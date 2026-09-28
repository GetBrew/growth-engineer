---
name: Customer.io
domain: customer.io
category: email
tagline: Messaging automation that sends email, push, SMS and in-app messages from customer data and behavior.
docs: https://docs.customer.io
github: https://github.com/customerio
mcp:
  url: https://mcp.customer.io/mcp
  auth: oauth
  docs: https://docs.customer.io/ai/mcp/get-started/
cli:
  install: npm install -g @customerio/cli
  binary: cio
  auth: api_key
  env: CIO_TOKEN
  keyUrl: https://fly.customer.io/settings/api_credentials?keyType=service_accounts
  docs: https://docs.customer.io/ai/cli/get-started/
api:
  url: https://api.customer.io
  auth: api_key
  env: CUSTOMERIO_API_KEY
  keyUrl: https://fly.customer.io/settings/api_credentials?keyType=app
  docs: https://docs.customer.io/integrations/api/app/
updated: 2026-09-27
---

Customer.io is a messaging automation platform: automations, broadcasts,
one-time sends and transactional messages go out by email, push, SMS, in-app
and WhatsApp, targeted with segments built from people's attributes and
events.

The MCP server and the `cio` CLI reach Customer.io's Journeys and Data
Pipelines APIs through generic tools: `cio_schema` finds an endpoint,
`cio_read_api` makes GET requests and `cio_write_api` makes POST, PUT and
PATCH requests (`cio schema` and `cio api <path>` on the CLI). An account
admin must first turn MCP on under Settings > AI; each person then signs in
with OAuth and grants scopes, and changing live data or sending messages over
MCP also needs the admin's permission. The CLI takes a service-account token
(`sa_live_...`) in `CIO_TOKEN`.

The API above is the App API, which sends transactional messages and
broadcasts and reads workspace data with an App API key as a Bearer token.
EU accounts use `https://mcp-eu.customer.io/mcp` and
`https://api-eu.customer.io`. People and events come in through the separate
Track and Pipelines APIs, which use Basic auth.
