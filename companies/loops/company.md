---
name: Loops
domain: loops.so
category: email
tagline: Email platform for software companies, with campaigns, event-triggered workflows and transactional email.
docs: https://loops.so/docs
github: https://github.com/loops-so
logo: loops.png
mcp:
  url: https://mcp.loops.so
  auth: oauth
  docs: https://loops.so/docs/mcp-server
cli:
  install: brew install loops-so/tap/loops
  binary: loops
  auth: api_key
  env: LOOPS_API_KEY
  keyUrl: https://app.loops.so/settings?page=api
  docs: https://loops.so/docs/cli
api:
  url: https://app.loops.so/api
  auth: api_key
  env: LOOPS_API_KEY
  keyUrl: https://app.loops.so/settings?page=api
  docs: https://loops.so/docs/api-reference/intro
updated: 2026-09-27
---

Loops is an email platform for software companies: marketing campaigns,
workflows that start when an event arrives or a contact changes, and
transactional email, all sent from one product.

The MCP server exposes four generic tools: `search` finds a Loops API
operation, `describe` shows its request shape, `execute` runs it for a team,
and `teams` lists the teams you can reach. It signs in with OAuth, so the
client must support Client ID Metadata Documents or be preregistered with
Loops. The `loops` CLI and the REST API take an API key. The API allows 10
requests per second per team, and 60 per minute on the content endpoints,
campaigns included.
