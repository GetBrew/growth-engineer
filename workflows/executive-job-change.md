---
title: Reach new executives in their first 90 days
summary: Track leadership changes and open a thoughtful conversation while new priorities and budgets are being set.
author: thedogwiththedataonit
version: 1
tags:
  - motion:outbound
  - channel:email
  - capability:find-work-emails
  - capability:write-copy
  - capability:manage-crm
inputs:
  - name: target_titles
    description: the roles to watch
    example: VP Marketing, Head of Growth
  - name: target_accounts
    description: company domains to watch
    example: acme.example, globex.example
steps:
  - title: Find new leaders
    tool: apollo/find-work-emails
    instruction: Across `target_accounts`, find people with `target_titles` who started in the last 90 days. Keep name, title, start date and work email.
  - title: Draft a note
    tool: anthropic/write-copy
    instruction: For each person, draft three lines about what a leader in that role usually fixes first. No pitch. Show the drafts to the user.
  - title: Log it
    tool: hubspot/manage-crm
    instruction: Create or update each contact and attach the approved draft as a note on the record.
doneWhen:
  - Every new leader has a contact record with a note.
  - The user has the list with start dates.
featured: 2
updated: 2026-09-16
---
