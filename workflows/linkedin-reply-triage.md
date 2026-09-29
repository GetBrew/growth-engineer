---
title: Sort LinkedIn replies and answer the interested ones first
summary: Reads new HeyReach conversations, labels each reply's intent with Jev, sends approved answers to the warm ones, and alerts sales in Slack.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:linkedin
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new LinkedIn reply with its intent, Jev's confidence and what was done with it.
- An approved answer sent to each interested, question, referral and not-now reply, from the sender account that owns the conversation.
- A Slack post for each interested reply and referral.

## Inputs

- `campaigns`: the HeyReach campaigns whose replies to read, by name, or all of them, e.g. Founders Q4
- `since`: when the last run ended, so only newer replies are read, e.g. 2026-09-28 09:00 UTC
- `min_confidence`: the confidence below which you label a reply yourself, e.g. 0.8
- `booking_link`: the calendar link an interested reply gets, e.g. https://cal.com/you/intro
- `alerts_channel`: the Slack channel for interested replies and referrals, e.g. #linkedin-replies

## Steps

1. **Pull new replies** with [heyreach/get-conversations](../companies/heyreach/tools/get-conversations.md). Read the unread conversations in `campaigns` whose newest message is from the prospect and arrived after `since`. Keep each conversation's ID, its sender account ID, the prospect's name, headline, company and profile URL, and their newest messages.
2. **Label the intent** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each prospect's newest messages as the state, with the earlier thread for context, and ask a choice `intent` of interested (wants a call, a demo or pricing), question (asks something before deciding), not_now (asks to talk later), referral (names someone else), objection (says why it doesn't fit), not_interested and small_talk (a thanks, an emoji or a pleasantry), and a noul `worth_answering`. Keep each reply's intent, its confidence and `worth_answering`.
3. **Settle the unsure ones**. Show the user every reply whose intent confidence is below `min_confidence`, with Jev's two most likely labels, and keep the label the user picks. Leave not_interested replies unanswered, and small_talk ones unless `worth_answering` is likely.
4. **Write the answers**. Draft two or three casual sentences per reply in the sender's voice: answer the question first, offer `booking_link` to interested replies, ask a referral for an introduction, and ask a not-now reply when to check back. Show the drafts to the user.
5. **Send** with [heyreach/send-message](../companies/heyreach/tools/send-message.md). After the user approves, send each answer into its conversation from the sender account that owns it.
6. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each interested reply and referral to `alerts_channel` with the prospect's name, headline, company, profile URL, the intent and the first line of their message.

## Notes

HeyReach can tag leads on its own; this play adds your own labels, a confidence you can hold replies to, and answers drafted from what each person wrote. Judge a thread by its newest message from the prospect: a reply that said "not now" a month ago and "let's talk" today is interested.

Run it at least daily with `since` set to the previous run: LinkedIn replies go cold within a day.
