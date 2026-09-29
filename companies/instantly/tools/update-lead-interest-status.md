---
name: Set a lead's interest status
summary: Sets the interest status of one lead, found by email address and optionally a campaign, such as interested, not interested, out of office or wrong person.
notes: "`interest_value` is a number: 1 interested, -1 not interested, 0 out of office, -2 wrong person, 2 meeting booked, 3 meeting completed, 4 won, -3 lost, -4 no show, or a custom status's value; null resets the lead to Lead. Needs an active paid plan."
capability: classify-signals
docs: https://developer.instantly.ai/api-reference/lead/update-the-interest-status-of-a-lead
api: POST /api/v2/leads/update-interest-status
updated: 2026-09-29
---
