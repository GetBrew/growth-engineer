---
name: Crawl a website
summary: Follows links from a starting URL and returns the content of every page it reaches, within the limits you set.
notes: "The API starts a job and returns its `id`: read the pages with `GET /crawl/{id}`; the MCP tool waits for the crawl to finish. Set a `limit` and include or exclude paths to keep the crawl bounded."
capability: scrape-web
docs: https://docs.firecrawl.dev/api-reference/endpoint/crawl-post
mcp: firecrawl_crawl
cli: firecrawl crawl
api: POST /crawl
updated: 2026-09-26
---
