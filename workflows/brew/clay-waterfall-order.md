---
title: Find more work emails by ordering providers by hit rate
summary: Sample first, then run the waterfall in the order that actually finds emails for your list.
version: 1
tags:
  - capability:find-work-emails
inputs:
  - name: contacts_table
    description: the Clay table with name and company domain columns
steps:
  - title: Sample
    tool: clay/find-work-emails
    instruction: 50 rows from `contacts_table` and run each email provider on them. Record each provider's hit rate.
  - title: Reorder
    tool: clay/find-work-emails
    instruction: the providers from highest to lowest hit rate, stopping at the first verified email.
  - title: Run
    tool: clay/find-work-emails
    instruction: the reordered sequence on the full table, after the user confirms.
doneWhen:
  - The table has a verified email column.
  - The user has the hit rate for each provider.
featured: 11
updated: 2026-09-16
---
