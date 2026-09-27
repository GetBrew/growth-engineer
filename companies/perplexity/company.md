---
name: Perplexity
domain: perplexity.ai
category: ai-model
tagline: Real-time web search, web-grounded answers and research for agents and apps.
docs: https://docs.perplexity.ai
github: https://github.com/perplexityai
logo: perplexity.png
mcp:
  url: https://api.perplexity.ai/mcp
  auth: oauth
  docs: https://docs.perplexity.ai/docs/getting-started/integrations/mcp-server
cli:
  install: curl -fsSL https://github.com/perplexityai/perplexity-cli/releases/latest/download/install.sh | sh
  binary: pplx
  auth: api_key
  env: PERPLEXITY_API_KEY
  keyUrl: https://console.perplexity.ai/project/keys
  docs: https://docs.perplexity.ai/docs/cli/overview
api:
  url: https://api.perplexity.ai
  auth: api_key
  env: PERPLEXITY_API_KEY
  keyUrl: https://console.perplexity.ai/project/keys
  docs: https://docs.perplexity.ai/docs/getting-started/overview
updated: 2026-09-27
---

Perplexity's API platform brings real-time, web-wide research and Q&A to your
products. The Search API returns ranked web results; the Agent API answers and
researches with web search using models from several providers; the Router and
Embeddings APIs cover open-weight models and embeddings. Sonar Chat Completions
has been replaced by the Agent API and is supported only until September 27,
2026.

The hosted MCP server offers `perplexity_search`, `perplexity_ask`,
`perplexity_research` and `perplexity_reason`. It signs in with your Perplexity
account and bills tool calls to the API organization you pick, which you must
administer. The `pplx` CLI returns Search API results and page snippets as
JSON.
