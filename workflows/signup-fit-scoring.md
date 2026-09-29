---
title: Tell sales which new sign-ups fit your ideal customer
summary: Reads new Clerk sign-ups, looks up each work domain with Apollo, scores fit and flags fakes with Jev, and saves the result in Attio.
author: thedogwiththedataonit
motion: plg
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new sign-up with its company, fit level, bucket and Jev's confidence.
- Each company behind a work email created or updated in Attio with its fit level and bucket.
- A Slack post for each sign-up ready for a sales touch.
- The suspicious sign-ups, listed for you to review.

## Inputs

- `since`: when the last run ended, so only newer sign-ups are read, e.g. 2026-09-28
- `ideal_customer`: who you sell to, in a sentence or two, e.g. software teams of 20 or more at venture-backed or profitable companies
- `sales_floor`: the smallest company worth a sales touch, e.g. 50 employees
- `max_lookups`: the most companies to look up in one run, since each costs an Apollo credit, e.g. 100
- `min_confidence`: the confidence below which you bucket a sign-up yourself, e.g. 0.75
- `fit_attributes`: the Attio company attributes that hold the fit level and the bucket, created once, e.g. jev_fit and jev_bucket
- `sales_channel`: the Slack channel for sales-ready sign-ups, e.g. #plg-leads

## Steps

1. **Pull new sign-ups** with [clerk/list-users](../companies/clerk/tools/list-users.md). List the users who signed up after `since`. Keep each user's ID, name, email and sign-up time, and set aside personal email domains such as gmail.com.
2. **Look up the companies** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). Look up each work email's domain once, up to `max_lookups`. Keep each company's name, industry, employee count, funding and short description.
3. **Score and bucket** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each sign-up's email, name and company facts as the state, with a score `fit` against `ideal_customer` on four levels (no fit, weak, good, ideal), a choice `bucket` of sales_ready (fits and at least `sales_floor`), sales_assist (fits but smaller), self_serve (a person or a tiny team) and never_touch (a student, a competitor or a fake), and a noul `suspicious` (a disposable domain, a made-up name or a competitor). Keep every answer with its confidence or probability.
4. **Settle the unsure ones**. Show the user every sign-up whose bucket confidence is below `min_confidence`, with its two most likely buckets, and keep the bucket the user picks. List the sign-ups whose `suspicious` is likely.
5. **Save the fit** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). After the user approves, upsert each company by its domain with its most likely fit level and its bucket in `fit_attributes`.
6. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each sales_ready sign-up to `sales_channel` with the person, the company's size, industry and funding, and the fit level.

## Notes

Look up each company once, even when several people from it sign up, and say in the Slack post when several did. Sales-assist sign-ups suit a product-led nudge rather than a rep's time.

Run it daily with `since` set to the previous run.
