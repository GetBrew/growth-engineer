---
name: Notra
domain: usenotra.com
category: geo
tagline: Notra is a modern GEO tool that asks ChatGPT, Claude and Gemini the questions your buyers ask. See if you show up, who shows up instead and how to fix it.
docs: https://docs.usenotra.com
github: https://github.com/usenotra
logo: https://cdn.growth.engineer/icons/companies/notra-0ffbcc08.svg
mcp:
  url: https://mcp.usenotra.com/mcp
  auth: oauth
  docs: https://docs.usenotra.com/devtools/mcp
cli:
  install: npm i -g notra
  binary: notra
  auth: oauth
  docs: https://docs.usenotra.com/devtools/cli
api:
  url: https://api.usenotra.com
  auth: api_key
  env: NOTRA_API_KEY
  docs: https://docs.usenotra.com/api/authentication
updated: 2026-09-28
---

Notra tracks how AI answer engines such as ChatGPT, Perplexity and Gemini
mention a brand against its competitors, logs the AI crawler and referral
traffic a site gets, and plans and writes the articles that close the gaps
it finds. It also turns GitHub and Linear activity into changelogs, blog
posts and LinkedIn and X posts in the brand's voice.

The hosted MCP server and the `notra` CLI sign in with OAuth; the CLI and
the REST API also take an API key (`ntra_...`) created under API Keys in the
dashboard, scoped per organization. GEO calls are scoped to a project and
need a plan that includes GEO. Scans, sequences and content briefs use billed
AI credits.
