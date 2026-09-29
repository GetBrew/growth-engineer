---
name: G2
domain: g2.com
category: intent
tagline: The software review marketplace, with buyer intent data on the companies researching your product and its competitors.
docs: https://documentation.g2.com
logo: https://cdn.growth.engineer/icons/companies/g2-b338b2de.png
mcp:
  url: https://mcp.g2.com/mcp
  auth: oauth
  docs: https://documentation.g2.com/docs/g2-mcp-server
api:
  url: https://data.g2.com
  auth: api_key
  env: G2_API_KEY
  keyUrl: https://my.g2.com/developers
  docs: https://data.g2.com/api/v2/docs/index.html
updated: 2026-09-27
---

G2 is a marketplace where buyers compare business software through user
reviews. For vendors listed on it, G2 Buyer Intent shows which companies are
researching their product, category or competitors, alongside G2's reviews,
product catalog and categories.

The hosted MCP server signs in with OAuth 2.0. In Claude and ChatGPT, add the
G2 MCP connector from their catalogs. G2's OAuth server doesn't support
Dynamic Client Registration, so any other client first registers an OAuth app
in the G2 Developer Portal and uses its client ID and secret. What an account
can read depends on its G2 subscription: buyer intent needs a Buyer Intent
license, and Market Intelligence reviews need an Enterprise package.

The REST API takes a G2 access token as a Bearer token. Create one in the G2
Developer Portal under Access Tokens and choose the endpoints it can reach;
tokens expire a year after they are created. G2 allows 100 API requests per
second from each IP address.
