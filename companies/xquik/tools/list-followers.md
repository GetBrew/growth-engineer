---
name: List an X account's followers
summary: Returns public follower profiles for one X account, newest first, with optional filters on follower count, bio and location terms, and published email.
notes: "1 credit per follower returned; filters apply before billing. id takes a user ID, username or profile URL. pageSize is 20 to 300, default 200. While has_next_page is true, pass next_cursor as cursor with the same filters."
capability: find-prospects
docs: https://docs.xquik.com/api-reference/x/followers
mcp: getUserFollowers
cli: x-twitter-scraper x:users retrieve-followers
api: GET /x/users/{id}/followers
updated: 2026-10-31
---
