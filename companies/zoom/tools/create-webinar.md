---
name: Create a webinar
summary: Schedules a webinar for a webinar host and returns its ID, join URL and, when registration is on, its registration URL.
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/webinars/POST/users/{userId}/webinars
api: POST /users/{userId}/webinars
updated: 2026-09-26
---

For user-level apps, pass `me` instead of a user ID. Needs a Pro or higher plan with the Webinar add-on, and allows 100 requests per host per day.
