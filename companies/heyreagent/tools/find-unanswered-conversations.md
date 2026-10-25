---
name: Find unanswered conversations
summary: Returns the people whose last LinkedIn message you have not answered, across your live LinkedIn accounts.
notes: "Reads the stored copy of the inbox: when needsInboxSync names an account, run sync_inbox first. To answer, pass the row's profileUrl to send_message; profileUrl can be null. Up to 200 people per call."
capability: search-conversations
docs: https://heyreagent.com/docs/actions/who_is_waiting_on_me
mcp: who_is_waiting_on_me
api: POST /v1/actions/who_is_waiting_on_me
updated: 2026-10-25
---
