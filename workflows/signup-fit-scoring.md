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
- `competitors`: the companies whose people should never get a sales touch, by domain, e.g. rival.com, othertool.io
- `sales_floor`: the smallest company worth a sales touch, e.g. 50 employees
- `min_fit`: the lowest fit level worth a sales touch, e.g. good
- `max_lookups`: the most companies to look up in one run, since each costs an Apollo credit, e.g. 100
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `fit_attributes`: the Attio company attributes that hold the fit level and the bucket, created once, e.g. jev_fit and jev_bucket
- `sales_channel`: the Slack channel for sales-ready sign-ups, e.g. #plg-leads

## Steps

1. **Pull new sign-ups** with [clerk/list-users](../companies/clerk/tools/list-users.md). List the users who signed up after `since`. Keep each user's ID, name, email and sign-up time, and set aside personal email domains such as gmail.com.
2. **Look up the companies** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). Look up each work email's domain once, up to `max_lookups`. Keep each company's name, industry, employee count, funding and short description.
3. **Score them** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each sign-up's email, name and company facts as the state, with a score `fit` whose levels describe the match with `ideal_customer`: no fit (matches none of it), weak (matches some), good (matches most) and ideal (matches all); a choice `kind` of business (signing up for their company), individual (trying it alone) and never_touch (a student, a fake or someone from `competitors`); and a noul `suspicious` (a disposable domain, a made-up name or a domain in `competitors`). Keep every answer with its confidence or probability.
4. **Bucket them**. Show the user every sign-up whose kind or fit confidence is below `min_confidence`, or whose `suspicious` is unsure, and keep what the user decides. Mark each business sign-up sales_ready when its fit is `min_fit` or better and its company has at least `sales_floor` employees, sales_assist when it fits but is smaller, and self_serve otherwise; individuals are self_serve. List the suspicious and never_touch sign-ups.
5. **Save the fit** with [attio/upsert-record](../companies/attio/tools/upsert-record.md). After the user approves, upsert each company by its domain with its most likely fit level and its bucket in `fit_attributes`.
6. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each sales_ready sign-up to `sales_channel` with the person, the company's name, size, industry and funding, and the fit level.

## Notes

Look up each company once, even when several people from it sign up, and say in the Slack post when several did. Sales-assist sign-ups suit a product-led nudge rather than a rep's time.

Run it daily with `since` set to the previous run.
