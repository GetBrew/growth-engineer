---
name: Add a lead to a campaign
summary: Creates a lead in a lemlist campaign from an email, name, company and custom variables, optionally finding or verifying their email first; it never updates an existing lead.
capability: send-email
docs: https://developer.lemlist.com/api-reference/endpoints/leads/create-lead-in-campaign
cli: lemlist api POST /campaigns/{campaignId}/leads/
api: POST /campaigns/{campaignId}/leads/
updated: 2026-09-27
---

Replace `{campaignId}` with the campaign's id (`cam_...`). A contact that is
already in the campaign is refused with `400 LEAD_ALREADY_IN_CAMPAIGN`; set
`deduplicate=true` to also refuse contacts that are in another campaign.
`findEmail`, `verifyEmail`, `findPhone` and `linkedinEnrichment` spend
credits. A campaign automates outreach to its leads, so confirm the campaign
before adding people to it.
