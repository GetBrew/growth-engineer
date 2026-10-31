---
title: Send an approved follow-up and book the next call
summary: Builds a Bridge follow-up plan for a sales call, drafts the recap email for your approval, sends it, and schedules the next meeting.
author: Shahzaib0217
motion: outbound
tags:
  - channel:email
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A follow-up email you approved, sent from your connected mailbox, recapping the call, commitments and resources.
- The next meeting scheduled in Bridge, with the buyer invited.
- The rest of the follow-up plan, with each step done, skipped or left for you.

## Inputs

- `meeting`: the finished call, by title, account or day, e.g. Acme discovery call yesterday
- `resources`: links to share, e.g. https://example.com/case-study
- `next_meeting`: the next step to book, with its length and window, e.g. a 45-minute technical deep dive next week

## Steps

1. **Find the call** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Find `meeting` and confirm it with the user. Keep its `recapId`.
2. **Read the call** with [bridge/get-meeting-details](../companies/bridge/tools/get-meeting-details.md). Keep the buyer's names and emails, and the commitments each side made.
3. **Check for a plan** with [bridge/get-follow-up-plan](../companies/bridge/tools/get-follow-up-plan.md). Get the latest plan for the `recapId`. If there is one, keep its steps and skip step 4.
4. **Create the plan** with [bridge/create-follow-up-plan](../companies/bridge/tools/create-follow-up-plan.md). Generate a follow-up plan for the meeting. Keep its plan id and steps.
5. **Draft the email** with [bridge/act-on-follow-up-step](../companies/bridge/tools/act-on-follow-up-step.md). Run `draft` on the follow-up email step. If it fails with "Needs input" (e.g. a recipient who was not in the meeting), ask the user for what is missing and run `draft` again with it as `details`. To add `resources` and the commitments from step 2, run `approve` with them as `revision`: it only rewrites the draft. Show the user the new `draft_preview`.
6. **Send it** with [bridge/act-on-follow-up-step](../companies/bridge/tools/act-on-follow-up-step.md). After the user approves the exact preview, run `approve` on that step without `revision`. Skip or check off the other steps as the user says.
7. **Find a time** with [bridge/find-free-time](../companies/bridge/tools/find-free-time.md). Search the window in `next_meeting` for slots of its length, with `maxResults` set to 100, and offer the user three on different days. Keep the one they pick.
8. **Book the next call** with [bridge/create-meeting](../companies/bridge/tools/create-meeting.md). Schedule the meeting at the chosen time with the buyer's emails as invitees. Keep its join link for the user.

## Notes

The follow-up email goes out from the user's connected Gmail; without one, copy the approved draft into any email tool. To send the buyer a link to pick the time themselves, share a booking page instead of steps 7 and 8.
