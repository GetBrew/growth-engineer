---
title: Turn content downloads into useful conversations
summary: Personalise the follow-up around what someone read instead of dropping every lead into the same sequence.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: 5
updated: 2026-09-27
---

## Inputs

- `content_asset`: the asset that was downloaded, e.g. The 2026 outbound benchmark
- `follow_up_window`: how far back to look, e.g. 3 days
- `nurture_log`: the Notion database that logs each send

## Steps

1. **Pull downloads** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). List contacts who downloaded `content_asset` within `follow_up_window`. Keep name, company and email.
2. **Write follow-ups** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft one email per contact that references a specific section of the asset. Show the drafts to the user.
3. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Send each approved email to its contact.
4. **Log the send** with [notion/create-page](../companies/notion/tools/create-page.md). Append one row per sent email to `nurture_log` with contact, asset and date.

## Done when

- Every download in the window has a follow-up sent or declined.
- The nurture log has one row per send.
