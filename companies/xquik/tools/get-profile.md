---
name: Get an X profile
summary: Returns one public X profile with bio, follower and following counts, verification, location, and any email, phone numbers or links the profile publishes.
notes: "1 credit per call. id takes a numeric user ID, a username with or without @, or a URL-encoded profile URL; a number is always read as a user ID."
capability: enrich-contacts
docs: https://docs.xquik.com/api-reference/x/twitter-profile-lookup
mcp: getUser
api: GET /x/users/{id}
updated: 2026-10-31
---
