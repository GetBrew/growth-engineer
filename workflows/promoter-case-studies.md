---
title: Invite NPS promoters with specific praise to a case study
summary: Pulls 9s and 10s from your Typeform NPS survey, picks promoters whose praise names a result with Jev, and emails each a case-study invite.
author: thedogwiththedataonit
motion: content
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every recent promoter with whether their praise is specific, whether they also named a problem, and Jev's probabilities.
- An approved case-study invite sent to each promoter with specific praise and no open problem.
- The promoters who also named a problem, listed for customer success instead.

## Inputs

- `survey`: the Typeform NPS survey, by name, e.g. Quarterly NPS
- `score_field`: the ref of its 0 to 10 question, e.g. nps_score
- `comment_field`: the ref of its open question, e.g. nps_reason
- `email_field`: the ref of the email question, or the name of the hidden field that carries the email, e.g. email
- `lookback_days`: how far back to read responses, e.g. 14
- `interview_link`: the booking link for a 20-minute customer-story interview, e.g. https://cal.com/you/customer-story
- `do_not_contact`: the email addresses that asked not to be contacted, e.g. an export of your unsubscribes
- `from_address`: the verified Resend sender the invites come from, e.g. Sam at Acme <sam@acme.com>
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it

## Steps

1. **Pull promoters** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the responses to `survey` from the last `lookback_days`. Keep those with a `score_field` of 9 or 10, with the email from `email_field`, the score and the `comment_field` answer.
2. **Read their praise** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each comment as the state, with a noul `specific_praise` (names a feature, a result or a number), a noul `names_a_problem` (also mentions something that went wrong) and a score `enthusiasm` on three levels (satisfied; happy; delighted). Keep each answer.
3. **Pick who to invite**. Keep the promoters whose `specific_praise` is yes and whose `names_a_problem` is no, leaving out anyone in `do_not_contact`, by most likely enthusiasm level. Show the user the ones where either answer is unsure, and keep what the user decides. List the promoters who named a problem for customer success.
4. **Write the invites**. Draft a subject line and three sentences per promoter: thank them, quote the part of their comment that names what they liked, and invite them to a 20-minute interview for a customer story at `interview_link`. Show the drafts to the user.
5. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each invite from `from_address`, with an idempotency key per promoter.

## Notes

A promoter who wrote "the Salesforce sync saved us a day a week" has already named a result; the interview adds the detail and their approval to publish it. Show them the final text before it goes live, and if you thank them with anything of value, say so in the story.

It invites promoters to a case study rather than a public review, because many review sites, Google among them, forbid asking only happy customers for reviews. To grow reviews, ask every respondent. Run it after each survey wave.
