---
name: Search the web and read the top results
summary: Starts Apify's RAG Web Browser on a query, or on one URL, and returns the run's storage IDs; its dataset holds the top result pages as Markdown.
capability: research-accounts
docs: https://docs.apify.com/integrations/mcp
mcp: apify--rag-web-browser
updated: 2026-09-27
---

Pass `query` and `maxResults`, the number of top results to read. Like other
Actor tools, it returns the run's storage IDs rather than the pages: read
them with `get-dataset-items` and the returned `datasetId`. The Actor is
billed by Apify platform usage.
