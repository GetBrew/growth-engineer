---
name: Browse competitive intelligence
summary: Returns which competitors the companies researching your product are evaluating on G2, with their comparison activity.
capability: track-intent
docs: https://documentation.g2.com/docs/g2-mcp-server
mcp: browse_competitive_intelligence
updated: 2026-09-27
---

Only on the MCP server. Over the API, competitor activity is part of
browsing buyer intent for a product: rows whose `left_product_id` differs
from your product are activity on a competitor.
