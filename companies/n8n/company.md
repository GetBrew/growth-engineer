---
name: n8n
domain: n8n.io
category: automation
tagline: Workflow automation with AI for technical teams, on n8n Cloud or self-hosted.
docs: https://docs.n8n.io
github: https://github.com/n8n-io
logo: n8n.png
mcp:
  url: https://{your-n8n-domain}/mcp-server/http
  auth: oauth
  docs: https://docs.n8n.io/connect/connect-to-n8n-mcp-server
cli:
  install: npm install -g @n8n/cli
  binary: n8n-cli
  auth: api_key
  env: N8N_API_KEY
  docs: https://docs.n8n.io/connect/n8n-cli
api:
  url: https://{your-domain}/api/v1
  auth: api_key
  env: N8N_API_KEY
  header: X-N8N-API-KEY
  docs: https://docs.n8n.io/connect/n8n-api
updated: 2026-09-27
---

n8n is a workflow automation platform that combines AI capabilities with
business process automation, giving technical teams the flexibility of code
with the speed of no-code. It runs on n8n Cloud or self-hosted, so every way in
points at your own instance: `{your-n8n-domain}` and `{your-domain}` are its
domain without `https://`, such as `your-instance.app.n8n.cloud` on n8n Cloud
or the domain that serves your n8n editor when self-hosted.

The built-in MCP server is off until an instance owner or admin turns on
Settings > Instance-level MCP. It signs in with OAuth, and an agent can run or
change only the workflows enabled for MCP access. The `n8n-cli` CLI and the
public REST API take an API key from Settings > n8n API, sent in the
`X-N8N-API-KEY` header; the CLI reads the instance URL from `N8N_URL`. The API
isn't available during the free trial.
