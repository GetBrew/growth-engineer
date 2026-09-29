---
title: Resend a campaign to people who did not open it
summary: Builds a Brew audience of everyone who did not open a send, writes a new subject line with you, and resends the same email to them.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- The same email resent with a new subject line, only to contacts who never opened the first send.
- The number of contacts it went to.

## Inputs

- `send_id`: the Brew send to follow up
- `email_id`: the email design that send delivered
- `original_subject`: the subject line it went out with
- `wait_days`: how long to wait after the first send, e.g. 3

## Steps

1. **Segment** with [brew/create-audience-from-events](../companies/brew/tools/create-audience-from-events.md). If `send_id` went out less than `wait_days` ago, stop and tell the user when to run this again. Otherwise build an audience of its recipients who did not open it, leaving out bounces and unsubscribes, and wait until it has built. Keep its audience ID and size.
2. **Rewrite the subject**. Write two alternatives to `original_subject` that make a different promise. Show them to the user and keep the one they choose.
3. **Resend** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send `email_id` with the chosen subject to the audience from step 1.
