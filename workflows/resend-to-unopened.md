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
- `email_id`: the email that send delivered
- `original_subject`: its subject line
- `wait_days`: how long to wait after the first send, e.g. 3

## Steps

1. **Segment** with [brew/create-audience-from-events](../companies/brew/tools/create-audience-from-events.md). Build an audience of the contacts in `send_id` who did not open it, at least `wait_days` after it went out. Wait until it has built, then keep its audience ID and size.
2. **Rewrite** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Write two alternatives to `original_subject` that make a different promise. Show them to the user and keep the one they choose.
3. **Resend** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send `email_id` with the chosen subject line to the audience from step 1.

## Done when

- Only contacts who never opened received the resend.
- The user has the number of contacts it went to.
