---
title: Reach NPS detractors while the score is fresh
summary: Pull low scores from your NPS survey, route each one to its account owner with the comment, and draft a reply that listens.
author: thedogwiththedataonit
tags:
  - motion:retention
  - channel:email
  - channel:chat
updated: 2026-09-27
---

## Inputs

- `form_id`: the Typeform NPS survey
- `score_field`: the ref of its 0 to 10 question, e.g. nps_score
- `comment_field`: the ref of its open question, e.g. nps_reason
- `email_field`: the ref of the email question, or the name of the hidden field that carries the email, e.g. email
- `lookback_days`: how far back to read responses, e.g. 7
- `cs_channel`: the Slack channel to post in, e.g. #customer-success

## Steps

1. **Pull detractors** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the responses to `form_id` submitted in the last `lookback_days`. Keep those with a `score_field` of 6 or less, with the email from `email_field`, the score and the `comment_field` answer.
2. **Find their owner** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts by each email. Keep the contact ID, company name and `hubspot_owner_id`; note the emails with no contact.
3. **Route it** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per detractor to `cs_channel` with the score, the comment, the company and the owner ID.
4. **Write the reply**. Draft a short plain-text reply for each detractor's owner to send that thanks them, restates their comment in one line and asks for 15 minutes. Show the drafts to the user.
5. **Log it** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID with the score, the comment and the approved reply.

## Done when

- Every detractor in the window has a Slack post and a drafted reply.
- Each matched contact has a note, and the user has the emails with no contact.
