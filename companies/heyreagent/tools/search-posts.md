---
name: Search posts
summary: Returns LinkedIn posts matching keywords, filtered by date, the author's headline, industry or company, or the companies a post mentions.
notes: "Company and industry filters take names, and the action uses the top match. datePosted is past_day, past_week or past_month. Up to 50 posts per call; a nextCursor works only on the account that ran the search."
capability: track-intent
docs: https://heyreagent.com/docs/actions/search_posts
mcp: search_posts
api: POST /v1/actions/search_posts
updated: 2026-10-25
---
