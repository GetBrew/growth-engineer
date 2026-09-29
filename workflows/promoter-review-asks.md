---
title: Ask your happiest NPS promoters for a public review
summary: Pulls 9s and 10s from your Typeform NPS survey, picks promoters with specific praise using Jev, and emails each a review ask via Resend.
author: thedogwiththedataonit
motion: content
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every recent promoter with whether their praise is specific, whether they also named a problem, and Jev's probabilities.
- An approved review ask sent to each promoter with specific praise and no open problem.
- The promoters who also named a problem, listed for customer success instead.

## Inputs

- `survey`: the Typeform NPS survey, by name, e.g. Quarterly NPS
- `score_field`: the ref of its 0 to 10 question, e.g. nps_score
- `comment_field`: the ref of its open question, e.g. nps_reason
- `email_field`: the ref of the email question, or the name of the hidden field that carries the email, e.g. email
- `lookback_days`: how far back to read responses, e.g. 14
- `review_link`: the page where a customer writes a review, e.g. your G2 review page
- `from_address`: the verified Resend sender the asks come from, e.g. Sam at Acme <sam@acme.com>
- `min_probability`: how likely a comment must be to count as specific praise, e.g. 0.7

## Steps

1. **Pull promoters** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the responses to `survey` from the last `lookback_days`. Keep those with a `score_field` of 9 or 10, with the email from `email_field`, the score and the `comment_field` answer.
2. **Read their praise** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each comment as the state, with a noul `specific_praise` (names a feature, a result or a number), a noul `names_a_problem` (also mentions something that went wrong) and a score `enthusiasm` on three levels (satisfied; happy; delighted). Keep each answer.
3. **Pick who to ask**. Keep the promoters whose `specific_praise` is at least `min_probability` and whose `names_a_problem` is unlikely, most enthusiastic first. List the promoters who named a problem for customer success.
4. **Write the asks**. Draft three sentences per promoter: thank them, quote the part of their comment that names what they liked, and ask them to say the same at `review_link`. Show the drafts to the user.
5. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each ask from `from_address`, with an idempotency key per promoter.

## Notes

A promoter who wrote "the Salesforce sync saved us a day a week" has already written the review; asking them to post it is a small request. A promoter who also named a problem hears from customer success first, not from a review ask.

Offer nothing in exchange for a review unless the review site's rules allow it. Run it after each survey wave.
