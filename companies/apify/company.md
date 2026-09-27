---
name: Apify
domain: apify.com
category: scraper
tagline: Cloud platform and store of ready-made scrapers, called Actors, that turn websites into data.
docs: https://docs.apify.com
github: https://github.com/apify
logo: apify.svg
mcp:
  url: https://mcp.apify.com
  auth: oauth
  docs: https://docs.apify.com/integrations/mcp
cli:
  install: npm install -g apify-cli
  binary: apify
  auth: oauth
  docs: https://docs.apify.com/cli/docs
api:
  url: https://api.apify.com/v2
  auth: api_key
  env: APIFY_TOKEN
  keyUrl: https://console.apify.com/settings/integrations
  docs: https://docs.apify.com/api/v2
updated: 2026-09-27
---

Apify is a cloud platform for web scraping and automation. Its programs,
called Actors, run in the cloud from JSON input and save their results to
datasets, and Apify Store lists ready-made Actors such as scrapers for Google
Search, Google Maps and Instagram. The MCP server, the `apify` CLI and the
REST API search the Store, run Actors and read their results.

The MCP server signs in with OAuth in the browser, or takes an Apify API token
as a Bearer header. The CLI signs in through Apify Console with `apify login`,
and the API takes the token as a Bearer token. Each Actor sets its own
pricing, such as Apify platform usage, a price per result or a price per
event.
