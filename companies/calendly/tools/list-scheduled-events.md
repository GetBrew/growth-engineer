---
name: List scheduled events
summary: Returns the meetings scheduled with a user, group or organization, filtered by invitee email, status and start time.
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/list-scheduled-events
mcp: meetings-list_events
api: GET /scheduled_events
updated: 2026-09-27
---

Pass `user` or `organization` as a URI (`users-get_current_user` or
`GET /users/me` returns yours); organization-wide results need admin or owner
rights. Filter by `invitee_email` to check whether a prospect has already
booked, and by `min_start_time` and `max_start_time` in UTC. Pages hold 20
events by default; follow `page_token` for more.
