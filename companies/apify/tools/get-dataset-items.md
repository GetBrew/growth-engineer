---
name: Get an Actor run's results
summary: Returns the items an Actor run saved to a dataset, such as scraped records, a page at a time.
capability: scrape-web
docs: https://docs.apify.com/api/v2/dataset-items-get
mcp: get-dataset-items
cli: apify datasets get-items
api: GET /datasets/{datasetId}/items
updated: 2026-09-27
---

Pass the dataset ID the run returned (`defaultDatasetId` on the run object)
and page with `limit` and `offset`. The API and the CLI can also return the
items as CSV, JSONL, XLSX and other formats.
