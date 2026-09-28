---
name: List webinar registrants
summary: Returns a webinar's registrants with their registrant ID, email, name and registration time, filtered by approval status.
notes: Match a past participant to their registration by `registrant_id` to get the email Zoom leaves empty for people outside your account. Needs a Pro or higher plan with the Webinar add-on.
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/webinars/GET/webinars/{webinarId}/registrants
api: GET /webinars/{webinarId}/registrants
updated: 2026-09-28
---
