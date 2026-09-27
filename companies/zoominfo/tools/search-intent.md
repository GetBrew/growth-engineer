---
name: Find companies showing buyer intent
summary: Returns intent signals for up to 50 topics, each naming a company researching the topic with its signal score, audience strength and date, plus recommended contacts there.
capability: track-intent
docs: https://docs.gtm.ai/reference/searchinterface_searchintent
mcp: search_intent
cli: gtm intent search
api: POST /data/v1/intent/search
updated: 2026-09-27
---

Your ZoomInfo package must include Intent. Topic names must match ZoomInfo's
exactly, so look them up first (`gtm lookup --field intent-topics`), and
narrow results with firmographic filters and a minimum signal score between
60 and 100. The search consumes no credits, but each signal returned counts
as a record toward your limits.
