---
name: AlphaOSINT
domain: alphaosint.com
category: data-provider
tagline: Structured data from public business records, such as LinkedIn profiles, company pages and job listings, run as Apify Actors over MCP or a REST API.
docs: https://alphaosint.com/directory/
mcp:
  url: https://mcp.apify.com/?tools=johnvc/linkedin-profile-api,johnvc/linkedin-company-api,johnvc/linkedin-people-search-api,johnvc/linkedin-company-employees-api,johnvc/crunchbase-company-api,johnvc/google-maps-places-api,johnvc/Google-Jobs-Scraper,johnvc/linkedin-jobs-api
  auth: oauth
  docs: https://docs.apify.com/integrations/mcp
  notes: "Apify's hosted MCP server; the URL loads one tool per listed source, named like johnvc--linkedin-profile-api. Sign in to Apify in the browser, or send an Apify token as a Bearer header. A tool waits up to 45 seconds; for longer runs, poll get-actor-run, then get-dataset-items."
api:
  url: https://api.apify.com/v2
  auth: api_key
  env: APIFY_TOKEN
  keyUrl: https://console.apify.com/settings/integrations
  docs: https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post
  notes: "Each source is an Apify Actor: POST its JSON input and the response holds the result rows. A run longer than 300 seconds returns 408; start a long run with the Actor's /runs endpoint instead and read its dataset. Runs bill to the Apify account."
updated: 2026-11-02
---

AlphaOSINT maintains extractors for public business records: company pages
and registries, people profiles, job listings, filings and reviews. Each
source has a documented input schema and returns its results as JSON rows.
The data comes from published pages, filings and registries, with no
purchased personal data and nothing behind a login.

Access is sold through Apify, which handles billing, keys and rate limits.
An agent calls a source as a tool on Apify's MCP server, or runs it over
Apify's REST API with an Apify token. Each source is billed per result or
per page, as its page on alphaosint.com states, and Apify has a free tier.
