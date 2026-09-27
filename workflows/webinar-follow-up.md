---
title: Create a webinar follow-up that reflects attendance
summary: Send different next steps to attendees, no-shows and highly engaged viewers without manual list work.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: 6
updated: 2026-09-27
---

## Inputs

- `webinar_id`: the webinar to work from

## Steps

1. **List attendees** with [zoom/list-webinar-participants](../companies/zoom/tools/list-webinar-participants.md). From `webinar_id`, list who attended and add up each person's time across rejoins; 40 minutes or more makes them engaged.
2. **List no-shows** with [zoom/list-webinar-absentees](../companies/zoom/tools/list-webinar-absentees.md). From `webinar_id`, list the registrants who did not attend.
3. **Write three emails** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft one email per list: the recording for no-shows, the next step for attendees, a call offer for the engaged. Show the drafts to the user.
4. **Tag contacts** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Set a contact property with the list each person landed in.
5. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Send each list its approved email.

## Done when

- Every registrant is in exactly one list.
- Approved emails are sent and the property is set.
