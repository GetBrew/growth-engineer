---
title: Turn qualified inbound leads into booked meetings
summary: Reads new form leads, enriches and qualifies them, and drafts a personal reply with a Bridge booking link and open times for each good fit.
author: Shahzaib0217
motion: inbound
tags:
  - channel:email
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A table of every lead since the last run, with role, company, size, a fit verdict and the reason.
- A Bridge booking page for sales calls, created if you did not have one.
- A Gmail draft for each qualified lead, with a personal note, the booking link and three open times.

## Inputs

- `form`: the Typeform form that collects leads, by name, e.g. Contact sales
- `since`: when the last run happened, e.g. 2026-10-16
- `ideal_customer`: a sentence on who fits, e.g. B2B companies with 50 to 1,000 employees and a sales team
- `booking_page`: the booking page for these calls, by name, e.g. Intro call
- `max_lookups`: the most leads to enrich in one run, e.g. 50

## Steps

1. **Pull new leads** with [typeform/retrieve-responses](../companies/typeform/tools/retrieve-responses.md). Get `form`'s responses submitted since `since`. Keep each lead's name, email, company and answers.
2. **Look them up** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match up to `max_lookups` leads on their email. Keep title, seniority, employer and employer website; mark anyone without a match.
3. **Size the company** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each employer website, keep industry and employee count.
4. **Qualify**. Compare each lead with `ideal_customer` and their answers. Mark each as fit, maybe or not a fit, with a one-line reason, and show the table to the user.
5. **Find the booking page** with [bridge/list-booking-pages](../companies/bridge/tools/list-booking-pages.md). Match `booking_page` to an active page. Keep its id and public link. If none matches, go to step 6; otherwise skip it.
6. **Create the page** with [bridge/create-booking-page](../companies/bridge/tools/create-booking-page.md). After the user agrees, create `booking_page` as a 30-minute page with status active. Keep its id and public link.
7. **Find open times** with [bridge/find-free-time](../companies/bridge/tools/find-free-time.md). Get the page's bookable slots for the next seven days, with `page` set to its id and `maxResults` set to 100. Keep three slots on different days.
8. **Write the replies**. For each fit lead, draft a short reply that answers what they asked in the form, offers the three times in the lead's time zone when the form or Apollo gives one, otherwise in yours with the zone named, and links the booking page. The slot labels are in your time zone, so convert from their UTC start. Show the drafts to the user.
9. **Save the drafts** with [google/create-draft](../companies/google/tools/create-draft.md). Create one Gmail draft per approved reply, addressed to the lead.

## Notes

Typeform is the lead source here; any form, CRM list or inbound inbox works if it gives a name, email and company. To book the meeting for a lead who already chose a time, use `bridge/book-meeting` with a slot from step 7.

Run it daily with `since` set to the previous run. Personal emails rarely match in Apollo; qualify those leads from their answers.
