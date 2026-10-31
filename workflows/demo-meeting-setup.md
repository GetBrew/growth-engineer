---
title: Set up a product demo with invites, brief and agenda
summary: Schedules a recorded Bridge demo at a free time, invites the prospects, generates a brief and writes a demo agenda to the Notepad.
author: Shahzaib0217
motion: outbound
tags:
  - channel:email
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A scheduled Bridge demo meeting with recording and AI notes on, and its join link.
- An invitation with the join link sent to each prospect.
- A brief on the prospects and a demo agenda tied to their needs in the meeting's Notepad.

## Inputs

- `prospects`: who is coming, by email, e.g. dana@acme.com, lee@acme.com
- `company`: the prospect's company, e.g. Acme
- `use_case`: what they want to see, e.g. booking pages for their sales team
- `duration_minutes`: how long the demo runs, e.g. 45
- `window`: the days to look in, e.g. next Monday to Wednesday

## Steps

1. **Check the history** with [bridge/search-people](../companies/bridge/tools/search-people.md). Search each prospect's email. Keep anyone Bridge already knows, with their title and company.
2. **Read past calls** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Search transcripts for `company`. Keep the needs, objections and questions already raised.
3. **Find a time** with [bridge/find-free-time](../companies/bridge/tools/find-free-time.md). Search `window` for slots of `duration_minutes`, with `maxResults` set to 100, and offer the user three. Keep the one they pick.
4. **Schedule the demo** with [bridge/create-meeting](../companies/bridge/tools/create-meeting.md). Create a meeting titled with `company` and the product at the chosen time, with `prospects` as invitees. Keep its `recap_id` and join link.
5. **Turn on recording** with [bridge/update-meeting](../companies/bridge/tools/update-meeting.md). Turn on recording, automatic recording, transcription and AI notes, and set lobby access to trusted so invited prospects who sign in with their invited email go straight in; anyone else waits in the lobby for you to admit them.
6. **Generate the brief** with [bridge/generate-meeting-brief](../companies/bridge/tools/generate-meeting-brief.md). Generate the brief for the `recap_id`. Keep the attendee profiles and context.
7. **Write the agenda**. Draft a demo agenda for `use_case`: a short intro, the two or three flows that answer the needs and objections from step 2, time for questions, and the next step to ask for. Show it to the user.
8. **Save the agenda** with [bridge/update-meeting-notepad](../companies/bridge/tools/update-meeting-notepad.md). Append the approved agenda to the meeting's Notepad.

## Notes

The demo is not added to your calendar; share the join link in your own calendar invite if the prospect expects one. To let the prospect choose the time, send a booking page link instead of steps 3 and 4.
