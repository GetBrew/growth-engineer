---
name: List scheduled events
summary: Returns the meetings scheduled with a user, group or organization, filtered by invitee email, status and start time.
notes: "Needs a `user` or `organization` URI (the current-user call returns yours); organization-wide results need admin or owner rights. Pages hold 20 events by default: follow `page_token` for more."
capability: book-meetings
docs: https://developer.calendly.com/api-docs/calendly-api/scheduled-events/list-scheduled-events
mcp: meetings-list_events
api: GET /scheduled_events
updated: 2026-09-27
---
