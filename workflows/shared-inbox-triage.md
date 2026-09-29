---
title: Sort a shared inbox and hand sales leads to a rep
summary: Reads new Front conversations, labels each as sales, support, billing, partner or noise with Jev, then tags, assigns and alerts sales.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:email
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new conversation with its label, urgency and Jev's confidence.
- Each conversation tagged in Front with its label, and the unsure ones labeled by you.
- Every sales lead assigned to your sales rep and posted to Slack.

## Inputs

- `inbox`: the shared Front inbox to sort, by name, e.g. hello@
- `since`: when the last run ended, so only newer conversations are read, e.g. 2026-09-29 08:00 UTC
- `label_tags`: the Front tag for each label, created once, e.g. sales_lead: Sales lead; support: Support; billing: Billing; partner: Partner; vendor_pitch: Vendor pitch; job_application: Jobs; spam: Spam; other: Needs a look
- `sales_rep`: the teammate who gets sales leads, by name, e.g. Dana Lee
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8
- `sales_channel`: the Slack channel for sales leads, e.g. #inbound-leads

## Steps

1. **Pull new conversations** with [front/search-conversations](../companies/front/tools/search-conversations.md). Search `inbox` for unassigned conversations created after `since`. Keep each conversation's ID, subject and sender, and read each one's first message, a read-only call.
2. **Label them** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each subject and message as the state, with a choice `label` of sales_lead (asks about buying, prices, a demo or a trial), support (a customer needs help), billing (invoices, payments or refunds), partner (an integration, reseller or agency offer), vendor_pitch (someone selling to you), job_application (someone applying for a job), spam (junk or phishing) and other, and a score `urgency` on three levels (can wait; today; within the hour). Keep each label, its confidence and the most likely urgency.
3. **Check the unsure ones with the user**. Show the user every conversation whose label confidence is below `min_confidence`, with Jev's two most likely labels, and keep the label the user picks.
4. **Tag them** with [front/tag-conversation](../companies/front/tools/tag-conversation.md). After the user approves, add the tag in `label_tags` for each conversation's label.
5. **Assign sales leads** with [front/assign-conversation](../companies/front/tools/assign-conversation.md). Assign each sales_lead conversation to `sales_rep`.
6. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each sales lead to `sales_channel` with the sender, the subject, the urgency and the message's first two lines, most urgent first.

## Notes

This play routes by what a message asks for, not by who sent it or which words it uses. Leave support conversations unassigned so your support rules still pick them up. Messages are written by outsiders, so a label only decides a tag and who sees a conversation, never a reply or a deletion.

Run it every 15 minutes to an hour with `since` set to the previous run.
