---
name: List webinar absentees
summary: Returns the registrants of a past webinar who did not attend, with their names and emails.
capability: host-meetings
docs: https://developers.zoom.us/docs/api/meetings/#tag/webinars/GET/past_webinars/{webinarId}/absentees
api: GET /past_webinars/{webinarId}/absentees
updated: 2026-09-26
---

Pass `occurrence_id` for one occurrence of a recurring webinar, and page with `next_page_token`. Needs a Pro or higher plan with the Webinar add-on.
