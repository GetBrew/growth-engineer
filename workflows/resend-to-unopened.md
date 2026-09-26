---
title: Win a second open with a subject-line resend
summary: Resend a campaign to the people who never opened it, with a subject line they have not seen.
author: thedogwiththedataonit
version: 1
tags:
  - channel:email
  - capability:send-email
featured: 12
updated: 2026-09-16
---

## Inputs

- `campaign_id`: the campaign to resend
- `wait_days`: how long to wait after the first send, e.g. 3

## Steps

1. **Segment** with [brew/build-audience](../companies/brew/tools/build-audience.md). the contacts in `campaign_id` who have not opened after `wait_days`.
2. **Rewrite** with [brew/write-copy](../companies/brew/tools/write-copy.md). two alternative subject lines that make a different promise from the original. Show them to the user.
3. **Resend** with [brew/send-email](../companies/brew/tools/send-email.md). the campaign with the chosen subject line to the unopened segment, after the user approves.

## Done when

- Only unopened contacts received the resend.
- The user has the open rate of both sends.
