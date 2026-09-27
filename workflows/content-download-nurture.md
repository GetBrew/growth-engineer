---
title: Turn content downloads into useful conversations
summary: Personalise the follow-up around what someone read instead of dropping every lead into the same sequence.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: 5
updated: 2026-09-16
---

## Inputs

- `content_asset`: the asset that was downloaded, e.g. The 2026 outbound benchmark
- `follow_up_window`: how far back to look, e.g. 3 days

## Steps

1. **Pull downloads** with [hubspot/manage-crm](../companies/hubspot/tools/manage-crm.md). List contacts who downloaded `content_asset` within `follow_up_window`. Keep name, company and email.
2. **Write follow-ups** with [brew/write-copy](../companies/brew/tools/write-copy.md). Draft one email per contact that references a specific section of the asset. Show the drafts to the user; send only after approval.
3. **Log the send** with [notion/manage-docs](../companies/notion/tools/manage-docs.md). Append one row per sent email to the nurture log database with contact, asset and date.

## Done when

- Every download in the window has a follow-up sent or declined.
- The nurture log has one row per send.
