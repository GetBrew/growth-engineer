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

- A table of every new request with its fit level, route, Jev's confidence and the person and company behind it.
- Each real lead created or updated in HubSpot with its fit level and a note on its route, and spam, vendors and job seekers left out.
- A single-use booking link and a drafted reply for each sales lead with a good enough fit.
- A Slack post for each lead routed to sales.

## Inputs

- `form`: the Typeform demo request form, by name, e.g. Book a demo
- `form_fields`: the refs of its email, name, company and message questions, e.g. email, full_name, company, what_do_you_need
- `since`: the cutoff the last run reported, so only newer requests are read, e.g. 2026-09-29 08:00 UTC
- `ideal_customer`: who you sell to, in a sentence or two, e.g. B2B software companies of 50 to 1,000 employees with a sales team
- `min_fit`: the lowest fit level that earns a booking link, e.g. good
- `max_enrichments`: the most people to enrich in one run, since each match costs an Apollo credit, e.g. 50
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `fit_property`: the HubSpot contact property that holds the fit level, created once as a number from 0 to 3, e.g. jev_fit_level
- `event_type`: the Calendly event type sales books demos on, e.g. 30 minute demo
- `sales_channel`: the Slack channel for leads routed to sales, e.g. #inbound-leads

## Steps

1. **Pull new requests** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Read the completed responses to `form` submitted after `since` and more than 30 minutes ago, since the newest may not be there yet. Keep each response's answers to `form_fields`, and tell the user that 30-minute cutoff to use as the next `since`.
2. **Enrich** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match up to `max_enrichments` work emails; skip personal email domains. Keep the person's title and seniority, and their company's name, domain, industry and employee count.
3. **Score and route** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each request's answers and enrichment as the state, with a score `fit` whose levels describe the match with `ideal_customer`: no fit (matches none of it), weak (matches some), good (matches most) and ideal (matches all); a choice `route` of sales (a team evaluating or ready to buy), self_serve (a small team that wants to try it), partner (wants to integrate, resell or refer), existing_customer (a customer asking for help), job_seeker (asks about jobs), vendor_pitch (sells something to you), spam (junk or nonsense) and other; and a noul `active_evaluation` (names a deadline, a budget or a tool they are replacing). Keep each answer with its confidence or probability.
4. **Check the unsure ones with the user**. Show the user every request whose route or fit confidence is below `min_confidence`, with its two most likely routes, and keep what the user picks.
5. **Log the leads** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). After the user approves, upsert every request not routed to job_seeker, vendor_pitch or spam by email, with its name, company, title and most likely fit level in `fit_property`. Keep each contact's ID.
6. **Note why** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID with the route, the fit level, `active_evaluation` and their message.
7. **Make booking links** with [calendly/create-scheduling-link](../companies/calendly/tools/create-scheduling-link.md). For each lead routed to sales with a fit of `min_fit` or better, create a single-use link on `event_type`. Keep each link.
8. **Write the replies**. Draft a two-sentence reply for each lead with a booking link that answers their message in one line and offers the link, for a rep to send. Show the drafts to the user.
9. **Alert sales** with [slack/post-message](../companies/slack/tools/post-message.md). Post each sales lead to `sales_channel` with their name, email, title, company, size and industry, the fit level, `active_evaluation`, the message, the booking link and the drafted reply.

## Notes

Read each score by its most likely level: TypeSafe's docs warn against reading the expected value between two levels as a magnitude. To rank leads within a level, sort by the probability of the top two levels together. List the self_serve leads for whoever runs your onboarding emails rather than a rep.

Run it every hour with `since` set to the cutoff the previous run reported, so each lead is routed within the hour.
