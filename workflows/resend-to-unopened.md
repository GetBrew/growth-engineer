---
title: Win a second open with a subject-line resend
summary: Resend a campaign to the people who never opened it, with a subject line they have not seen.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
updated: 2026-09-27
---

## Inputs

- `send_id`: the Brew send to follow up
- `email_id`: the email design that send delivered
- `original_subject`: the subject line it went out with
- `wait_days`: how long to wait after the first send, e.g. 3

## Steps

1. **Segment** with [brew/create-audience-from-events](../companies/brew/tools/create-audience-from-events.md). If `send_id` went out less than `wait_days` ago, stop and tell the user when to run this again. Otherwise build an audience of its recipients who did not open it, leaving out bounces and unsubscribes, and wait until it has built. Keep its audience ID and size.
2. **Rewrite the subject**. Write two alternatives to `original_subject` that make a different promise. Show them to the user and keep the one they choose.
3. **Resend** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send `email_id` with the chosen subject to the audience from step 1.

## Done when

- Only contacts who never opened received the resend.
- The user has the number of contacts it went to.
