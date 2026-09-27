---
name: Add leads to a campaign
summary: Adds up to 1,000 leads to one Instantly campaign or lead list, checking their emails against blocklists and existing leads.
capability: send-email
docs: https://developer.instantly.ai/api-reference/lead/add-leads-in-bulk-to-a-campaign-or-list
api: POST /api/v2/leads/add
updated: 2026-09-27
---

Pass `campaign_id` or `list_id`, not both, and a `leads` array; in a campaign
every lead needs an `email`, and each lead can carry fields such as
`first_name`, `company_name` and `personalization`. `skip_if_in_workspace`,
`skip_if_in_campaign` and `skip_if_in_list` skip people you already have, and
`verify_leads_on_import` verifies their emails in the background. The key
needs the `leads:create` scope (or `leads:all`, `all:create`, `all:all`).
Leads added to an active campaign can start receiving its emails, so confirm
the campaign first.
