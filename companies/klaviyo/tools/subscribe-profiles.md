---
name: Subscribe profiles to marketing
summary: Records marketing consent for up to 1,000 profiles on email, SMS, WhatsApp or push, optionally adding them to a list.
capability: build-audience
docs: https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles
mcp: subscribe_profile_to_marketing
cli: klaviyo profiles bulk-subscribe-profiles
api: POST /api/profile-subscription-bulk-create-jobs
updated: 2026-09-27
---

If the list uses double opt-in, each profile gets a confirmation message
first. Subscribing also removes unsubscribe, spam-report and user
suppressions. To add profiles to a list without touching consent, use Add
Profiles to List (`add_profiles_to_list`,
`POST /api/lists/{id}/relationships/profiles`).
