---
name: List replies to an X post
summary: Returns the direct replies to one X post, each with its author's profile, engagement counts and media, plus a cursor for the next page.
notes: "1 credit per reply returned. id takes a post ID or URL-encoded post URL. Direct replies only: to search a thread, search posts with q=conversation_id:{id}. Reply visibility depends on X, so a missing row does not prove someone did not reply."
capability: search-conversations
docs: https://docs.xquik.com/api-reference/x/tweet-replies
mcp: getTweetReplies
cli: x-twitter-scraper x:tweets get-replies
api: GET /x/tweets/{id}/replies
updated: 2026-10-31
---
