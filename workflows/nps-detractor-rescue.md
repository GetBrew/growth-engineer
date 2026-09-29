---
title: Follow up on low NPS scores while they are fresh
summary: Pulls low scores from your Typeform NPS survey, posts each with its comment and HubSpot owner to Slack, and drafts a reply.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:email
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A post in `cs_channel` for each detractor, with the score, the comment, the company and the owner.
- A drafted reply for each detractor, for its owner to send.
- A HubSpot note on each matched contact, and the emails that matched no contact.

## Inputs

- `survey`: the Typeform NPS survey, by name, e.g. Quarterly NPS
- `score_field`: the ref of its 0 to 10 question, e.g. nps_score
- `comment_field`: the ref of its open question, e.g. nps_reason
- `email_field`: the ref of the email question, or the name of the hidden field that carries the email, e.g. email
- `lookback_days`: how far back to read responses, e.g. 7
- `cs_channel`: the Slack channel to post in, e.g. #customer-success

## Steps

1. **Pull detractors** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the responses to `survey` submitted in the last `lookback_days`. Keep those with a `score_field` of 6 or less, with the email from `email_field`, the score and the `comment_field` answer.
2. **Find their owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts by each email. Keep the contact ID, company name and `hubspot_owner_id`; note the emails with no contact.
3. **Route it** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per detractor to `cs_channel` with the score, the comment, the company and the owner ID.
4. **Write the reply**. Draft a short plain-text reply for each detractor's owner to send that thanks them, restates their comment in one line and asks for 15 minutes. Show the drafts to the user.
5. **Log it** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID with the score, the comment and the approved reply.
