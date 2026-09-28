---
name: Search the web
summary: Returns web pages that match a natural-language query, up to 100 per call, with their text, highlights or summaries, and can focus on company pages, people profiles or news.
notes: "On MCP, domain, date and category filters need `web_search_advanced_exa`: list it in the server URL's `tools` parameter with every other tool you want, since the list replaces the defaults."
capability: search-web
docs: https://exa.ai/docs/reference/search
mcp: web_search_exa
api: POST /search
updated: 2026-09-27
---
