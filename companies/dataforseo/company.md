---
name: DataForSEO
domain: dataforseo.com
category: data-provider
tagline: SERP, keyword and backlink data, aggregated from search engines and the web.
docs: https://docs.dataforseo.com/v3
logo: https://cdn.growth.engineer/icons/companies/dataforseo-92ce10fd.png
api:
  url: https://api.dataforseo.com/v3
  auth: api_key
  scheme: Basic
  env: DATAFORSEO_API_KEY
  keyUrl: https://app.dataforseo.com/register
  docs: https://docs.dataforseo.com/v3
  notes: "DATAFORSEO_API_KEY holds the base64 of `login:password` from your DataForSEO account."
updated: 2026-09-29
---

DataForSEO aggregates SERP, keyword, backlink and business-listing data from
Google, Bing and other sources. Most endpoints run as a task you post then
collect; its `/live` endpoints, like keyword search volume, return results
in the same call.
