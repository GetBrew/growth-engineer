---
name: Add a lead to a campaign
summary: Creates a lead in a lemlist campaign from an email, name, company and custom variables, optionally finding or verifying their email first; it never updates an existing lead.
notes: "The campaign automates outreach to its leads: confirm it first. `findEmail`, `verifyEmail`, `findPhone` and `linkedinEnrichment` spend credits, and a lead already in the campaign is refused with `400 LEAD_ALREADY_IN_CAMPAIGN`."
capability: enroll-in-sequence
docs: https://developer.lemlist.com/api-reference/endpoints/leads/create-lead-in-campaign
cli: lemlist api POST /campaigns/{campaignId}/leads/
api: POST /campaigns/{campaignId}/leads/
updated: 2026-09-27
---
