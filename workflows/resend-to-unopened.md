---
title: Win a second open with a subject-line resend
summary: Resend a campaign to the people who never opened it, with a subject line they have not seen.
author: thedogwiththedataonit
tags:
  - channel:email
featured: 12
updated: 2026-09-27
---

## Inputs

- `campaign_id`: the campaign to resend
- `wait_days`: how long to wait after the first send, e.g. 3

## Steps

1. **Segment** with [brew/create-audience-from-events](../companies/brew/tools/create-audience-from-events.md). Build an audience of the contacts in `campaign_id` who have not opened after `wait_days`.
2. **Rewrite** with [brew/generate-email](../companies/brew/tools/generate-email.md). Write two alternative subject lines that make a different promise from the original. Show them to the user.
3. **Resend** with [brew/send-email](../companies/brew/tools/send-email.md). Send the campaign with the chosen subject line to the unopened audience, after the user approves.

## Done when

- Only unopened contacts received the resend.
- The user has the open rate of both sends.
