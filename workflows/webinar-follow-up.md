---
title: Create a webinar follow-up that reflects attendance
summary: Send different next steps to attendees, no-shows and highly engaged viewers without manual list work.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: true
updated: 2026-09-27
---

## Inputs

- `webinar_id`: the Zoom webinar to work from
- `engaged_minutes`: the watch time that makes an attendee engaged, e.g. 40
- `list_property`: the HubSpot contact property that records each person's list, e.g. webinar_follow_up

## Steps

1. **List attendees** with [zoom/list-webinar-participants](../companies/zoom/tools/list-webinar-participants.md). From `webinar_id`, list who attended and add up each person's time across rejoins. Keep two lists: engaged, at `engaged_minutes` or more, and attended, under it.
2. **List no-shows** with [zoom/list-webinar-absentees](../companies/zoom/tools/list-webinar-absentees.md). From `webinar_id`, list the registrants who did not attend. Keep them as the third list.
3. **Write three emails** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email per list: the recording for no-shows, the next step for attendees, a call offer for the engaged. Show the drafts to the user. Keep each approved email's `emailId`.
4. **Tag contacts** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update every person, matched on email, with `list_property` set to their list.
5. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Send each list its approved `emailId`, with the list's emails as inline recipients.

## Done when

- Every registrant is in exactly one of the three lists.
- Approved emails are sent and `list_property` is set on every contact.
