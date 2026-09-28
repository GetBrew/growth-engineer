---
name: Exa
domain: exa.ai
category: web-search
tagline: Web search for AI agents, with page contents, cited answers, monitors and a research agent.
docs: https://exa.ai/docs
github: https://github.com/exa-labs
mcp:
  url: https://mcp.exa.ai/mcp?login
  auth: oauth
  docs: https://exa.ai/docs/get-started/exa-mcp
api:
  url: https://api.exa.ai
  auth: api_key
  env: EXA_API_KEY
  keyUrl: https://dashboard.exa.ai/api-keys
  docs: https://exa.ai/docs/get-started/quickstart
updated: 2026-09-27
---

Exa is a web search engine built for AI agents. Its API searches the web in
natural language, with categories for company pages and people profiles,
returns clean page contents, answers questions with citations, reruns
searches on a schedule as monitors, and runs Exa Agent for multi-step
research, list building and enrichment with structured output.

The hosted MCP server also works without a key at free rate limits. Signing
in with OAuth (the `?login` URL) uses your team's plan and turns on
`agent_run`; a client without OAuth can send an API key in the `x-api-key`
header instead. The API takes the key as a Bearer token or in `x-api-key`.
Usage is pay-as-you-go, and new accounts start with free credits.
