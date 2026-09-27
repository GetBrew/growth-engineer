---
title: Create a webinar follow-up that reflects attendance
summary: Send different next steps to attendees, no-shows and highly engaged viewers without manual list work.
author: thedogwiththedataonit
tags:
  - motion:inbound
  - channel:email
featured: 6
updated: 2026-09-16
---

## Inputs

- `webinar_id`: the webinar to work from

## Steps

1. **Split the audience** with [zoom/host-meetings](../companies/zoom/tools/host-meetings.md). From `webinar_id`, build three lists: attended, did not attend, and attended for 40 minutes or more.
2. **Write three emails** with [brew/write-copy](../companies/brew/tools/write-copy.md). Draft one email per list: the recording for no-shows, the next step for attendees, a call offer for the engaged. Show the drafts to the user.
3. **Tag contacts** with [hubspot/manage-crm](../companies/hubspot/tools/manage-crm.md). Set a contact property with the list each person landed in, then send the approved emails.

## Done when

- Every registrant is in exactly one list.
- Approved emails are sent and the property is set.
