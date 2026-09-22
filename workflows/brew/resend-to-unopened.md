---
title: Win a second open with a subject-line resend
summary: Resend a campaign to the people who never opened it, with a subject line they have not seen.
version: 1
tags:
  - channel:email
  - capability:send-email
inputs:
  - name: campaign_id
    description: the campaign to resend
  - name: wait_days
    description: how long to wait after the first send
    example: "3"
steps:
  - title: Segment
    tool: brew/build-audience
    instruction: the contacts in `campaign_id` who have not opened after `wait_days`.
  - title: Rewrite
    tool: brew/write-copy
    instruction: two alternative subject lines that make a different promise from the original. Show them to the user.
  - title: Resend
    tool: brew/send-email
    instruction: the campaign with the chosen subject line to the unopened segment, after the user approves.
doneWhen:
  - Only unopened contacts received the resend.
  - The user has the open rate of both sends.
featured: 12
updated: 2026-09-16
---
