---
title: Schedule a Bridge meeting at a time you are free
summary: Finds open times on your calendar, schedules a Bridge video meeting at the one you pick, invites everyone and adds an agenda.
author: Shahzaib0217
motion: outbound
tags:
  - channel:email
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A scheduled Bridge meeting at a time you chose, with its join link.
- An invitation email with the join link sent to every participant.
- An agenda in the meeting's Notepad, ready when the meeting starts.

## Inputs

- `participants`: who to meet, by email, not counting yourself, e.g. dana@acme.com, lee@acme.com
- `purpose`: what the meeting is for, e.g. Walk Acme through the pilot plan
- `duration_minutes`: how long it runs, e.g. 30
- `window`: the days to look in, e.g. next Tuesday to Thursday
- `options`: how many times to offer, e.g. 3

## Steps

1. **Find open times** with [bridge/find-free-time](../companies/bridge/tools/find-free-time.md). Search `window` for slots of `duration_minutes` with `maxResults` set to 100 and without a booking page, so your connected calendar, bookings and Bridge meetings are all checked. Keep each slot's start, end and local label.
2. **Pick a time**. Offer the user the `options` earliest slots, spread across different days when you can, and keep the one they choose.
3. **Schedule the meeting** with [bridge/create-meeting](../companies/bridge/tools/create-meeting.md). Create a meeting titled after `purpose` at the chosen start time for `duration_minutes`, with `participants` as invitees. Keep its `recap_id` and join link.
4. **Write the agenda**. Draft three to five agenda points for `purpose` and show them to the user.
5. **Save the agenda** with [bridge/update-meeting-notepad](../companies/bridge/tools/update-meeting-notepad.md). Append the approved agenda to the meeting's Notepad by its `recap_id`.

## Notes

Bridge never emails the host, so leave your own address out of `participants`. The meeting is not added to your calendar: add the join link to a calendar event yourself, or share it in your own message. To let people pick a time themselves, use a booking page instead (`create-booking-page`).
