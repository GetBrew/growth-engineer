---
name: Transformer.gg
domain: transformer.gg
category: sales-engagement
tagline: Book sponsored posts from X creators, from a dashboard or your AI agent.
docs: https://transformer.gg/docs
github: https://github.com/NBV-AppFactory/transformer-mcp
mcp:
  url: https://transformer.gg/mcp
  auth: oauth
  docs: https://transformer.gg/docs/mcp.md
cli:
  install: curl -fsSL https://transformer.gg/install | sh
  binary: transformer
  auth: api_key
  env: TRANSFORMER_API_KEY
  keyUrl: https://transformer.gg/docs
  docs: https://transformer.gg/docs/mcp.md
api:
  url: https://transformer.gg/api/v1
  auth: api_key
  env: TRANSFORMER_API_KEY
  keyUrl: https://transformer.gg/docs
  docs: https://transformer.gg/docs/rest.md
  notes: "Sending offers is free; a saved card is charged only when a creator accepts. Creators keep 80% (20% fee on paid offers). No subscription, seats or API fees."
status: published
updated: 2026-11-26
---

Transformer.gg is a marketplace for sponsored posts on X. A brand pastes its website and gets a list of X creators who fit what it sells, each with a suggested price. Brands send offers from the web dashboard or hand the workflow to an agent through the MCP server, CLI or REST API.

Every offer gets a tracked link so clicks and sales are credited to the creator who drove them. Sending is free; the saved card is charged only when a creator accepts, and payment is held until the post is live with X's Paid partnership label and confirmed by the team. Transformer.gg is part of North Bay Ventures (North Bay Opco I, Inc., Miami, Florida). The founder is Jon Oringer, who founded Shutterstock.
