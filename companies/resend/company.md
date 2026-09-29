---
name: Resend
domain: resend.com
category: email
tagline: Email API for developers, with broadcasts, contacts and event-triggered automations.
docs: https://resend.com/docs
github: https://github.com/resend
logo: https://cdn.growth.engineer/icons/companies/resend-d121ce10.png
mcp:
  url: https://mcp.resend.com/mcp
  auth: oauth
  docs: https://resend.com/docs/mcp-server
cli:
  install: npm install -g resend-cli
  binary: resend
  auth: api_key
  env: RESEND_API_KEY
  keyUrl: https://resend.com/api-keys
  docs: https://resend.com/docs/cli
api:
  url: https://api.resend.com
  auth: api_key
  env: RESEND_API_KEY
  keyUrl: https://resend.com/api-keys
  docs: https://resend.com/docs/api-reference/introduction
updated: 2026-09-27
---

Resend is an email API for developers. It sends transactional email and
marketing broadcasts from your verified domains, keeps contacts in segments
with topic subscriptions, and runs automations that custom events start. The
hosted MCP server, the `resend` CLI and the REST API each cover the whole
platform.

The MCP server signs in with OAuth; an agent that can't open a browser can
send an API key as a Bearer token instead. Direct API requests must also send
a `User-Agent` header, and a team gets 10 requests per second by default.
