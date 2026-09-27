---
name: Ask a question
summary: Answers a question from current web sources with inline citations, tuned for quick facts and short summaries.
capability: research-accounts
docs: https://docs.perplexity.ai/api-reference/agent-post
mcp: perplexity_ask
api: POST /v1/agent
updated: 2026-09-27
---

`perplexity_ask` is backed by the Agent API's `fast` preset: on the API, send
`preset: "fast"` with the question as `input`. For questions that chain
evidence across many sources, use the `medium` or `high` preset instead.
