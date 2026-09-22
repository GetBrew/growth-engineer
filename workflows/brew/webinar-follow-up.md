---
title: Create a webinar follow-up that reflects attendance
summary: Send different next steps to attendees, no-shows and highly engaged viewers without manual list work.
version: 1
tags:
  - motion:inbound
  - channel:email
  - capability:host-meetings
  - capability:send-email
  - capability:manage-crm
inputs:
  - name: webinar_id
    description: the webinar to work from
steps:
  - title: Split the audience
    tool: zoom/host-meetings
    instruction: "From `webinar_id`, build three lists: attended, did not attend, and attended for 40 minutes or more."
  - title: Write three emails
    tool: brew/write-copy
    instruction: "Draft one email per list: the recording for no-shows, the next step for attendees, a call offer for the engaged. Show the drafts to the user."
  - title: Tag contacts
    tool: hubspot/manage-crm
    instruction: Set a contact property with the list each person landed in, then send the approved emails.
doneWhen:
  - Every registrant is in exactly one list.
  - Approved emails are sent and the property is set.
featured: 6
updated: 2026-09-16
---
