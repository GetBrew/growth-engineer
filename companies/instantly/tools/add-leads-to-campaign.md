---
name: Add leads to a campaign
summary: Adds up to 1,000 leads to one Instantly campaign or lead list, checking their emails against blocklists and existing leads.
notes: "Leads added to an active campaign can start receiving its emails: confirm the campaign first. Pass `campaign_id` or `list_id`, not both; the key needs the `leads:create` scope."
capability: enroll-in-sequence
docs: https://developer.instantly.ai/api-reference/lead/add-leads-in-bulk-to-a-campaign-or-list
api: POST /api/v2/leads/add
updated: 2026-09-27
---
