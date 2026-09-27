---
name: List webinar participants
summary: Returns the people who attended a past webinar, with name, email, join and leave times and seconds attended.
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/webinars/GET/past_webinars/{webinarId}/participants
api: GET /past_webinars/{webinarId}/participants
updated: 2026-09-26
---

`duration` is in seconds per session: someone who leaves and rejoins appears again with a new entry, so add their durations up. `user_email` is empty for people outside the host's account, with some exceptions, so pass `include_fields=registrant_id` to match attendees to registrants. Needs a Pro or higher plan with the Webinar add-on.
