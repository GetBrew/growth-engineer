---
name: Find companies showing buyer intent
summary: Returns intent signals for up to 50 topics, each naming a company researching the topic with its signal score, audience strength and date, plus recommended contacts there.
notes: "Your package must include Intent. Topic names must match ZoomInfo's exactly: look them up first (`gtm lookup --field intent-topics`). Costs no credits, but each signal returned counts as a record toward your limits."
capability: track-intent
docs: https://docs.gtm.ai/reference/searchinterface_searchintent
mcp: search_intent
cli: gtm intent search
api: POST /data/v1/intent/search
updated: 2026-09-27
---
