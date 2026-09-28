---
title: Turn content downloads into useful conversations
summary: Personalise the follow-up around what someone read instead of dropping every lead into the same sequence.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: true
updated: 2026-09-27
---

## Inputs

- `asset_url`: where the downloaded asset lives, e.g. https://acme.example/benchmark
- `download_form`: the name HubSpot records for the form that gates the asset, e.g. 2026 outbound benchmark download
- `follow_up_window`: how far back to look, e.g. 3 days
- `nurture_log`: the Notion database that logs each send, with Contact, Section and Date properties

## Steps

1. **Read the asset** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch `asset_url` as markdown. Keep its section headings and one line on each.
2. **Pull downloads** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts whose `recent_conversion_event_name` contains `download_form` and whose `recent_conversion_date` falls within `follow_up_window`, leaving out anyone with `hs_email_optout` set. Keep name, email, job title, company and industry.
3. **Write follow-ups** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email per contact that picks the section from step 1 most relevant to their role and industry. Show the drafts to the user. Keep each approved email's `emailVersionId` and subject.
4. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Send each approved email to its one contact, with the idempotency key `<emailVersionId>:<email>`.
5. **Log the send** with [notion/create-page](../companies/notion/tools/create-page.md). Add one row per sent email to `nurture_log` with the contact, the section referenced and the date.

## Done when

- Every download in the window has a follow-up sent or declined.
- The nurture log has one row per send.
