---
name: Canva
domain: canva.com
category: design
tagline: Online visual suite for designing presentations, social posts, videos and other marketing assets.
docs: https://www.canva.dev/docs/apps/
github: https://github.com/canva-sdks
mcp:
  url: https://mcp.canva.com/mcp
  auth: oauth
  docs: https://www.canva.dev/docs/apps/mcp/
cli:
  install: npm install -g @canva/cli@latest
  binary: canva
  auth: oauth
  docs: https://www.canva.dev/docs/apps/canva-cli/
api:
  url: https://api.canva.com/rest/v1
  auth: oauth
  docs: https://www.canva.dev/docs/apps/rest-apis/
updated: 2026-09-26
---

Canva is an online visual communication and collaboration platform. Its MCP
server lets an AI assistant generate, edit, search and export a user's
designs; its REST APIs, also reachable through `canva api` in the Canva CLI,
let an app create, autofill, resize and export designs on the user's behalf.
Both act as a signed-in Canva user, and some calls need a paid Canva plan.
