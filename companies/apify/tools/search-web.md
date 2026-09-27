---
name: Search the web and read the top results
summary: Runs Apify's RAG Web Browser, which searches Google for a query and saves the content of the top result pages as Markdown, or fetches one page when the query is a URL.
capability: research-accounts
docs: https://docs.apify.com/integrations/mcp
mcp: apify--rag-web-browser
updated: 2026-09-27
---

Pass `query` and `maxResults`, the number of top results to read. Like other
Actor tools, it returns the run's storage IDs rather than the pages: read
them with `get-dataset-items` and the returned `datasetId`. The Actor is
billed by Apify platform usage.
