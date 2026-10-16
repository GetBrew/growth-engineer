---
name: looot
domain: looot.ai
category: data-provider
tagline: One API key and prepaid balance for about 2,500 data endpoints
docs: https://docs.looot.ai
github: https://github.com/loootai/looot-mcp
logo: https://cdn.growth.engineer/icons/companies/looot-bd493dca.png
mcp:
  url: https://api.looot.ai/mcp
  auth: oauth
  docs: https://docs.looot.ai/mcp-tools
  notes: Your client signs you in with the browser (OAuth 2.1 with dynamic client registration). A header token, Authorization Bearer, also works for CI.
api:
  url: https://api.looot.ai
  auth: api_key
  env: LOOOT_TOKEN
  keyUrl: https://looot.ai/settings
  docs: https://docs.looot.ai/reference
  notes: Send the token as Authorization Bearer. Every run needs an idempotencyKey. A workspace starts at $0, so top up before the first run.
status: published
updated: 2026-10-16
---

looot is one catalog of paid data endpoints from 90+ providers behind one
token and one prepaid balance. An agent searches the catalog, reads the price
before a call, and runs a job such as `people.email.find`. looot picks a
provider that can run it, with optional fallback to the next one, and a failed
call costs nothing.

The balance is prepaid, with no subscription and no free tier.
