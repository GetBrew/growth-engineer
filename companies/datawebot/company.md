---
name: datawebot
domain: datawebot.com
category: scraper
tagline: Ecommerce product data for agents — search products across online shops and list every seller's price with a direct link.
docs: https://www.datawebot.com/docs/agents
github: https://github.com/datawebot
mcp:
  url: https://mcp.datawebot.com/mcp
  auth: oauth
  docs: https://www.datawebot.com/docs/agents
updated: 2026-10-23
---

datawebot is a hosted MCP server for ecommerce product data. It searches
products for sale across online shops worldwide, lists each seller's price
for one product with a direct link to the product page, and runs extraction
Jobs on Amazon search and product pages in 10 countries, Walmart US, a set of
reviewed stores and the store domains in its endpoint directory. Stores added
through its automated probe are labelled "probe-qualified; live production
acceptance pending".

The MCP server signs in with OAuth through an email approval, with no
password. Sign-in is free; Jobs are paid in credits, and new accounts start
with 200 free trial credits. Results are best-effort snapshots with the time
they were retrieved; datawebot does not store price history or send alerts.
