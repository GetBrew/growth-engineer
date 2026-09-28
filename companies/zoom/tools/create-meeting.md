---
name: Create a meeting
summary: Schedules a meeting for a user and returns its ID, the join URL to share and the host's start URL.
notes: "Share only the `join_url`: the `start_url` is the host's and, for regular users, expires after two hours. Allows 100 requests per meeting host per day."
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/meetings/POST/users/{userId}/meetings
mcp: meeting_create
api: POST /users/{userId}/meetings
aliases:
  - zoom/host-meetings
updated: 2026-09-26
---
