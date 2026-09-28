---
name: List webinar participants
summary: Returns the people who attended a past webinar, with name, email, join and leave times and seconds attended.
notes: "Someone who rejoins gets a new entry, so add up their durations. `user_email` is empty for people outside the host's account: pass `include_fields=registrant_id` to match registrants. Needs Pro or higher with the Webinar add-on."
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/webinars/GET/past_webinars/{webinarId}/participants
api: GET /past_webinars/{webinarId}/participants
updated: 2026-09-26
---
