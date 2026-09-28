---
name: Run deep research
summary: Researches a question across many web sources with extended reasoning and returns a thorough answer with citations.
notes: "Over the API, send `preset: \"high\"` with the question as `input`. A long run can go in the background with `background: true`: poll it by its response ID."
capability: search-web
docs: https://docs.perplexity.ai/api-reference/agent-post
mcp: perplexity_research
api: POST /v1/agent
updated: 2026-09-27
---
