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

- `webinar_id`: the Zoom webinar's ID, or the instance UUID for one session of a recurring webinar
- `engaged_minutes`: the watch time that makes an attendee engaged, e.g. 40
- `recording_url`: the link to the recording, for no-shows
- `next_step`: what attendees should do next, with its link, e.g. start a trial at https://acme.example/trial
- `booking_url`: where engaged attendees book a call
- `list_property`: the HubSpot contact property that records each person's list as `no_show`, `attended` or `engaged`, e.g. webinar_follow_up

## Steps

1. **List attendees** with [zoom/list-webinar-participants](../companies/zoom/tools/list-webinar-participants.md). From `webinar_id`, list who attended with `include_fields=registrant_id`, leaving out hosts and panelists, and add up each person's seconds across rejoins. Keep two lists, engaged at `engaged_minutes` or more and attended under it, with each person's name, email and registrant ID.
2. **Fill in missing emails** with [zoom/list-webinar-registrants](../companies/zoom/tools/list-webinar-registrants.md). List the registrants of `webinar_id`. For each attendee with no email, keep the email of the registrant with the same registrant ID.
3. **List no-shows** with [zoom/list-webinar-absentees](../companies/zoom/tools/list-webinar-absentees.md). From `webinar_id`, list the registrants who did not attend. Keep them, with their names and emails, as the third list.
4. **Write three emails** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email per list: `recording_url` for no-shows, `next_step` for attendees, `booking_url` for the engaged. Show the drafts to the user. Keep each approved email's `emailVersionId` and subject.
5. **Tag contacts** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update every person, matched on email, with `list_property` set to their list.
6. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Once the user confirms the registrants agreed to hear from you, send each list its approved email, 50 inline recipients per send, each send with its own idempotency key.

## Done when

- Every registrant is in exactly one of the three lists.
- Approved emails are sent and `list_property` is set on every contact.
