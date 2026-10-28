---
title: Publish a booking page with intake questions
summary: Checks your existing booking pages, creates a Bridge booking page with your hours and intake questions, turns it on and returns its link.
author: Shahzaib0217
motion: inbound
tags:
  - channel:website
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A live Bridge booking page with the duration, hours, notice and intake questions you asked for.
- Its public link, with a short line to put on your website, email signature or outreach.
- A note on why the page is not live yet, when a host still needs to connect a calendar.

## Inputs

- `page_name`: what people see when they book, e.g. Intro call with Acme
- `duration_minutes`: the meeting length, e.g. 30
- `hours`: when people can book, with a time zone, e.g. Mon to Fri 10:00 to 16:00 America/New_York
- `notice`: the minimum notice and how far ahead people can book, e.g. 4 hours notice, up to 30 days ahead
- `intro`: the line people read before booking, e.g. A 30-minute call to see if Acme fits your team
- `questions`: what to ask each booker, with which are required, e.g. Company website (required); What do you want to cover?

## Steps

1. **Check for a page** with [bridge/list-booking-pages](../companies/bridge/tools/list-booking-pages.md). Look for a page with the same name or purpose as `page_name`. If one exists, ask the user whether to update it instead, and keep its id.
2. **Create the page** with [bridge/create-booking-page](../companies/bridge/tools/create-booking-page.md). Create `page_name`, turned off, with `duration_minutes`, `hours`, `notice`, `intro` as its description, `questions` as `addQuestions` and email reminders a day and an hour before. Keep its id and public link.
3. **Check the details** with [bridge/get-booking-page](../companies/bridge/tools/get-booking-page.md). Read the page back and compare its hours, time zone, notice, reminders and questions with what the user asked for, and check that every host's calendar is connected. Keep any difference.
4. **Fix any difference** with [bridge/update-booking-page](../companies/bridge/tools/update-booking-page.md). Correct each difference from step 3.
5. **Turn it on** with [bridge/set-booking-page-status](../companies/bridge/tools/set-booking-page-status.md). Once the user agrees to publish, set the page to active. Keep its status and public link.
6. **Write the share line**. Draft one sentence with the public link for a website, an email signature and an outreach email, and give the user all three.

## Notes

A page can take bookings only when every host has Google or Outlook Calendar connected; until then, step 5 fails and says why. Each meeting booked through it gets a Bridge video link and lands on the host's calendar.

Name and email are always asked. `addQuestions` keeps the page's optional Notes field after your questions; passing `questions` instead replaces the whole form.
