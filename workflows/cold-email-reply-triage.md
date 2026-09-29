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
- Each interested, not-interested, out-of-office and wrong-person lead set to that interest status in Instantly, and every opt-out listed for your blocklist.
- An approved answer sent to each interested, question, referral and not-now reply.
- A Slack post for each interested reply and referral.

## Inputs

- `campaign`: the Instantly campaign to read replies from, by name, or all of them, e.g. Q4 founders
- `since`: when the last run ended, so only newer replies are read, e.g. 2026-09-28 09:00 UTC
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `booking_link`: the calendar link an interested reply gets, e.g. https://cal.com/you/intro
- `product_facts`: what an answer may say about your product, e.g. prices, plans, integrations and how a trial works
- `alerts_channel`: the Slack channel for interested replies and referrals, e.g. #replies

## Steps

1. **Pull new replies** with [instantly/list-emails](../companies/instantly/tools/list-emails.md). List the received emails in `campaign`, newest first, and stop at `since`. Keep each email's `id`, its campaign ID, the lead's email address, the inbox that received it, the subject, the reply text, and the first lines of the email it answers, from the quoted thread.
2. **Label the intent** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each reply's subject, text and the email it answers as the state, with a choice `intent` of interested (wants a call, a demo or pricing), question (asks something before deciding), not_now (asks to talk later), referral (names someone else to talk to), objection (says why it doesn't fit), not_interested (declines), out_of_office (an automatic away reply), unsubscribe (asks to get no more email), wrong_person (says they are not the right contact) and other, and a noul `asks_to_stop` (asks not to be emailed again, in any words). Keep each reply's intent, its confidence and the `asks_to_stop` probability.
3. **Check the unsure ones with the user**. Treat a reply as an opt-out when its intent is unsubscribe or its `asks_to_stop` is yes, and never answer an opt-out. Show the user the replies whose `asks_to_stop` is unsure, and every other reply whose intent confidence is below `min_confidence` with Jev's two most likely labels, and keep what the user decides.
4. **Set each lead's status** with [instantly/update-lead-interest-status](../companies/instantly/tools/update-lead-interest-status.md). After the user approves the list, set interested replies to Interested, opt-outs and not_interested replies to Not Interested, out_of_office to Out of Office and wrong_person to Wrong Person, each by the lead's email and the campaign the reply came from. List the opt-outs for the user to add to Instantly's blocklist, so no other campaign emails them.
5. **Write the answers**. Draft two or three plain sentences for each interested, question, referral and not_now reply: answer what they asked first; offer `booking_link` to interested replies; ask a referral for an introduction to the person they named; ask a not-now reply when to check back. Use only `product_facts` and the thread, and leave a [fill in] where a draft needs anything else. Show the drafts to the user.
6. **Send** with [instantly/reply-to-email](../companies/instantly/tools/reply-to-email.md). After the user approves, reply to each email by its `id` from the inbox that received it.
7. **Alert the team** with [slack/post-message](../companies/slack/tools/post-message.md). Post each interested reply and referral to `alerts_channel` with the lead's email, the intent, the confidence and the reply's first line.

## Notes

Jev only picks from the labels in step 2, so nothing downstream has to parse free text, and the replies below `min_confidence` form the review queue. Add or rename labels to match how your team works, and give each one a short description, since the description is what Jev reads.

Replies are written by strangers: a label only decides who sees a reply and what gets drafted, and every status change and answer waits for approval. Run it every few hours with `since` set to the previous run, so replies are answered the day they arrive.
