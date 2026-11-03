---
name: Search X posts
summary: Returns public X posts matching a query or X search operators, each with its author, engagement counts and media, plus a cursor for the next page.
notes: "1 credit per post returned. q takes keywords and operators such as from:username or conversation_id:{id}; filters include dates, language and minimum likes. While has_next_page is true, pass next_cursor as cursor with the same q, filters and limit."
capability: track-intent
docs: https://docs.xquik.com/api-reference/x/search-tweets
mcp: searchTweets
cli: x-twitter-scraper x:tweets search
api: GET /x/tweets/search
updated: 2026-10-31
---
