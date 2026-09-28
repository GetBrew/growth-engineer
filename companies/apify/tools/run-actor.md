---
name: Run an Actor
summary: Starts an Apify Actor, such as a Google Maps or search-results scraper, with JSON input and returns the run's status and the ID of the dataset that holds its results.
notes: "The MCP tool waits up to 45 seconds for the run and the API up to 60 with `waitForFinish`: read the results with the dataset items call once the run has succeeded. Runs are billed; cap one with `maxTotalChargeUsd` on the API."
capability: scrape-web
docs: https://docs.apify.com/api/v2/actors-runs-post
mcp: call-actor
cli: apify actors call
api: POST /actors/{actorId}/runs
updated: 2026-09-27
---
