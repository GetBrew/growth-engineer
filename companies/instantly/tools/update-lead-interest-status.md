---
name: Set a lead's interest status
summary: Sets the interest status of one lead, found by email address and optionally a campaign, such as interested, not interested, out of office or wrong person.
notes: "`interest_value` is a status's number as the lead's `lt_interest_status` field lists it, or a custom status of the workspace; null resets the lead to Lead. Needs an active paid plan."
capability: classify-signals
docs: https://developer.instantly.ai/api-reference/lead/update-the-interest-status-of-a-lead
api: POST /api/v2/leads/update-interest-status
updated: 2026-09-29
---
