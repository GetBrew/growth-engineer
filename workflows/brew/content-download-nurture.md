---
title: Turn content downloads into useful conversations
summary: Personalise the follow-up around what someone read instead of dropping every lead into the same sequence.
version: 1
tags:
  - motion:inbound
  - channel:email
  - capability:manage-crm
  - capability:send-email
  - capability:manage-docs
inputs:
  - name: content_asset
    description: the asset that was downloaded
    example: The 2026 outbound benchmark
  - name: follow_up_window
    description: how far back to look
    example: 3 days
steps:
  - title: Pull downloads
    tool: hubspot/manage-crm
    instruction: List contacts who downloaded `content_asset` within `follow_up_window`. Keep name, company and email.
  - title: Write follow-ups
    tool: brew/write-copy
    instruction: Draft one email per contact that references a specific section of the asset. Show the drafts to the user; send only after approval.
  - title: Log the send
    tool: notion/manage-docs
    instruction: Append one row per sent email to the nurture log database with contact, asset and date.
doneWhen:
  - Every download in the window has a follow-up sent or declined.
  - The nurture log has one row per send.
featured: 5
updated: 2026-09-16
---
