---
title: Score and route every new demo request
summary: Reads new Typeform demo requests, enriches them with Apollo, scores fit and picks a route with Jev, and logs them in HubSpot.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:email
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of every new request with its fit level, route, confidence and the person and company behind it.
- Each real lead created or updated in HubSpot with its fit level and route, and spam, vendors and job seekers left out.
- A single-use booking link and a drafted reply for each lead routed to sales.
- A Slack post for each lead routed to sales.

## Inputs

- `form`: the Typeform demo request form, by name, e.g. Book a demo
- `message_field`: the ref of the question where people say what they need, e.g. what_do_you_need
- `since`: when the last run ended, so only newer requests are read, e.g. 2026-09-29 08:00 UTC
- `ideal_customer`: who you sell to, in a sentence or two, e.g. B2B software companies of 50 to 1,000 employees with a sales team
- `min_confidence`: the confidence below which you route a request yourself, e.g. 0.75
- `fit_property`: the HubSpot contact property that holds the fit level, created once as a number from 0 to 3, e.g. jev_fit_level
- `event_type`: the Calendly event type sales books demos on, e.g. 30 minute demo
- `sales_channel`: the Slack channel for leads routed to sales, e.g. #inbound-leads

## Steps

1. **Pull new requests** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the responses to `form` submitted since `since`. Keep each response's email, name, company and `message_field` answer.
2. **Enrich** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each work email; skip personal email domains. Keep the person's title and seniority, and the company's name, domain, industry and employee count.
3. **Score and route** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each request's answers and enrichment as the state, with a score `fit` against `ideal_customer` on four levels (no fit, weak, good, ideal), a choice `route` of sales (a team evaluating or ready to buy), self_serve (a small team that wants to try it), partner, existing_customer, job_seeker, vendor_pitch and spam, and a noul `active_evaluation` (names a deadline, a budget or a tool they are replacing). Keep each answer with its confidence or probability.
4. **Settle the unsure ones**. Show the user every request whose route confidence is below `min_confidence`, with its two most likely routes, and keep the route the user picks.
5. **Log the leads** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). After the user approves, upsert every request not routed to job_seeker, vendor_pitch or spam by email, with its name, company, title and most likely fit level in `fit_property`. Keep each contact's ID.
6. **Note why** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID with the route, the fit level, `active_evaluation` and their message.
7. **Make booking links** with [calendly/create-scheduling-link](../companies/calendly/tools/create-scheduling-link.md). For each lead routed to sales with a fit of good or ideal, create a single-use link on `event_type`. Keep each link.
8. **Write the replies**. Draft a two-sentence reply for each sales lead that answers their message in one line and offers their booking link, for a rep to send. Show the drafts to the user.
9. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each sales lead to `sales_channel` with the fit level, `active_evaluation`, title, company size and industry, the message, and the booking link.

## Notes

Read each score by its most likely level: TypeSafe's docs warn against reading the expected value between two levels as a magnitude. To rank leads within a level, sort by the probability of good and ideal together. Leads routed to self_serve are a good fit for a product-led nurture instead of a demo: add them to your onboarding emails rather than a rep's queue.

Run it every hour with `since` set to the previous run; speed to lead is the point of the play.
