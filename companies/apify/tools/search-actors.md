---
name: Find a scraper in Apify Store
summary: Returns Actors from Apify Store, Apify's marketplace of ready-made scrapers and automations, that match a search query, with each Actor's name, author and description.
capability: scrape-web
docs: https://docs.apify.com/api/v2/store-get
mcp: search-actors
cli: apify actors search
api: GET /store
updated: 2026-09-27
---

Search for the site or data you need, such as `google maps` or `job postings`,
then check an Actor's input schema and pricing before you run it:
`fetch-actor-details` on the MCP server, `apify actors info <actor> --input`
on the CLI. The CLI search needs no sign-in.
