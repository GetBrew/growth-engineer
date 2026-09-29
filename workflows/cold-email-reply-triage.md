---
title: Sort cold email replies by intent and answer the warm ones
summary: Reads new Instantly replies, labels each one's intent with Jev, sets the lead's interest status, and drafts answers to the warm ones.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new reply with its intent, Jev's confidence and what was done with it.
- Each sure reply's lead set to the matching interest status in Instantly, and the unsure ones labeled by you.
- An approved answer sent to each interested, question, referral and not-now reply.
- A Slack post for each interested reply and referral.

## Inputs

- `campaign`: the Instantly campaign to read replies from, by name, or all of them, e.g. Q4 founders
- `since`: when the last run ended, so only newer replies are read, e.g. 2026-09-28 09:00 UTC
- `min_confidence`: the confidence below which you label a reply yourself, e.g. 0.8
- `booking_link`: the calendar link an interested reply gets, e.g. https://cal.com/you/intro
- `alerts_channel`: the Slack channel for interested replies and referrals, e.g. #replies

## Steps

1. **Pull new replies** with [instantly/list-emails](../companies/instantly/tools/list-emails.md). List the received emails in `campaign`, newest first, and stop at `since`. Keep each email's `id`, the lead's email address, the inbox that received it, the subject and the reply text without the quoted thread.
2. **Label the intent** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each reply's subject and text as the state with a choice `intent` of interested (wants a call, a demo or pricing), question (asks something before deciding), not_now (asks to talk later), referral (names someone else), objection (says why it doesn't fit), out_of_office, unsubscribe and wrong_person, and a noul `asks_to_stop`. Keep each reply's intent, its confidence and the `asks_to_stop` probability.
3. **Settle the unsure ones**. Treat a reply whose `asks_to_stop` is above 0.5 as unsubscribe, whatever its intent. Show the user every reply whose intent confidence is below `min_confidence`, with Jev's two most likely labels, and keep the label the user picks.
4. **Set each lead's status** with [instantly/update-lead-interest-status](../companies/instantly/tools/update-lead-interest-status.md). After the user approves the list, set interested replies to Interested, unsubscribe replies to Not Interested, out_of_office to Out of Office and wrong_person to Wrong Person, each by the lead's email in `campaign`.
5. **Write the answers**. Draft two or three plain sentences for each interested, question, referral and not_now reply: answer what they asked first; offer `booking_link` to interested replies; ask a referral for an introduction to the person they named; ask a not-now reply when to check back. Show the drafts to the user.
6. **Send** with [instantly/reply-to-email](../companies/instantly/tools/reply-to-email.md). After the user approves, reply to each email by its `id` from the inbox that received it.
7. **Alert the team** with [slack/post-message](../companies/slack/tools/post-message.md). Post each interested reply and referral to `alerts_channel` with the lead's email, the intent, the confidence and the reply's first line.

## Notes

Jev only picks from the labels in step 2, so the same reply gets the same label on every run and nothing downstream has to parse free text. Its confidence is what makes the review queue: most replies clear `min_confidence` and flow straight through, and only the ambiguous ones reach a person. Add or rename labels to match how your team works, and give each one a short description, since the description is what Jev reads.

Run it every few hours with `since` set to the previous run, so replies are answered the day they arrive.
