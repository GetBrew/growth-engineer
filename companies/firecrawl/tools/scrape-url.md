---
name: Scrape a URL
summary: Returns one page as clean markdown, HTML, links or a screenshot, or as JSON fields extracted with a prompt or schema.
capability: scrape-web
docs: https://docs.firecrawl.dev/api-reference/endpoint/scrape
mcp: firecrawl_scrape
cli: firecrawl scrape
api: POST /scrape
aliases:
  - firecrawl/scrape-web
updated: 2026-09-26
---

For structured fields from a known page, request the JSON format with a prompt or schema; Firecrawl points here in place of its deprecated Extract MCP tool.
