---
name: Salesloft
domain: salesloft.com
category: sales-engagement
tagline: Revenue platform where sales teams run cadences, record conversations and manage deals.
docs: https://developers.salesloft.com
logo: salesloft.svg
mcp:
  url: https://mcp.salesloft.com/sse
  auth: oauth
  docs: https://help.salesloft.com/s/article/Salesloft-MCP-Server
api:
  url: https://api.salesloft.com
  auth: api_key
  env: SALESLOFT_API_KEY
  docs: https://developers.salesloft.com/docs/platform/api-basics/api-key-authentication/
updated: 2026-09-27
---

Salesloft is a revenue platform: sales teams keep people and accounts, run
cadences of email, phone and other steps, record and transcribe
conversations, and track opportunities synced from their CRM. Its hosted MCP
server is read-only and in beta: it searches and reads people, accounts,
opportunities, conversations and users, but can't write anything or read
cadences. It comes with Salesloft's Agent packages, an admin must turn on
Enable MCP Server under Settings > Artificial Intelligence Settings, users
sign in with OAuth, and every MCP call counts against the team's API rate
limit.

Customers call the REST API with an API key sent as a Bearer token: create
one under Your Applications > API Keys in Salesloft and give it the scopes the
calls need (partners build OAuth apps instead). Every path starts with `/v2`,
and the team shares a limit of 600 cost points per minute.
