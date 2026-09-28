---
name: Get an Actor run's results
summary: Returns the items an Actor run saved to a dataset, such as scraped records, a page at a time.
notes: Needs the dataset ID from a finished Actor run (`defaultDatasetId` on the run object).
capability: scrape-web
docs: https://docs.apify.com/api/v2/dataset-items-get
mcp: get-dataset-items
cli: apify datasets get-items
api: GET /datasets/{datasetId}/items
updated: 2026-09-27
---
