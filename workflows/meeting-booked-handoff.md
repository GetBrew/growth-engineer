---
title: Brief the rep the moment a meeting is booked
summary: Looks up each new Calendly booking with Apollo, logs the person in HubSpot with a brief, and posts the brief to Slack for the rep.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:chat
added: 2026-09-28
updated: 2026-09-29
---

## Outcome

- A HubSpot contact with a brief for every sales meeting booked since the last run.
- A Slack brief per meeting: who, their role, the company, their answers and the start time.
- The list of meetings, with anyone Apollo could not match.

## Inputs

- `since`: when the last run happened, so only new bookings count, e.g. 24 hours ago
- `event_types`: the Calendly event types that are sales meetings, e.g. Intro call, Demo
- `sales_channel`: the Slack channel for briefs, e.g. #booked-meetings

## Steps

1. **List new bookings** with [calendly/list-scheduled-events](../companies/calendly/tools/list-scheduled-events.md). List your active events that start in the future. Keep the ones of `event_types` created after `since`, with each event's `uuid`, name, start time and host.
2. **Get the invitees** with [calendly/list-event-invitees](../companies/calendly/tools/list-event-invitees.md). For each event `uuid`, keep each invitee's name, email and booking-question answers.
3. **Look them up** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each invitee on their email. Keep title, seniority, employer and employer website; mark anyone with no match as not enriched and carry on.
4. **Size the company** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each employer website, keep employee count, industry and latest funding round.
5. **Log the contact** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update each invitee, matched on email, with their name, title and company. Keep each contact's HubSpot ID.
6. **Attach the brief** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Add a note to each contact ID with the meeting time, their answers and the company facts.
7. **Brief the rep** with [slack/post-message](../companies/slack/tools/post-message.md). Post one brief per meeting to `sales_channel`: who, their role, the company in one line, their answers and the start time.
