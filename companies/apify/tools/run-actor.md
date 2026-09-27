---
name: Run an Actor
summary: Starts an Apify Actor, such as a Google Maps or search-results scraper, with JSON input and returns the run's status and the ID of the dataset that holds its results.
capability: scrape-web
docs: https://docs.apify.com/api/v2/actors-runs-post
mcp: call-actor
cli: apify actors call
api: POST /actors/{actorId}/runs
updated: 2026-09-27
---

Name the Actor as `username/actor-name` (`username~actor-name` in an API
path) and pass input that matches its input schema. The MCP tool waits up to
45 seconds for the run to finish and the API up to 60 with `waitForFinish`;
read the results with `get-dataset-items` once the run has succeeded. On the
CLI, `--output-dataset` prints the results. Over the API, `maxTotalChargeUsd`
caps what a run can cost, and `POST /actors/{actorId}/run-sync-get-dataset-items`
waits up to 300 seconds and returns the items in the response.
