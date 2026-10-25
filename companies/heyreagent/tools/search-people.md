---
name: Search people
summary: Returns LinkedIn people matching plain keywords, a place name and connection degree, each with a profile URL.
notes: "location is a place name, which the action looks up. At most 10 rows per call; pass nextCursor for the next page with the other inputs unchanged. Rows count toward 1,000 search rows a day per account."
capability: find-prospects
docs: https://heyreagent.com/docs/actions/search_people
mcp: search_people
api: POST /v1/actions/search_people
updated: 2026-10-25
---
