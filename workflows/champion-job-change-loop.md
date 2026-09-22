---
title: Reconnect when a product champion changes jobs
summary: Track past champions, identify their new company, and reopen the relationship with the context you already earned.
author: thedogwiththedataonit
version: 1
tags:
  - motion:outbound
  - channel:linkedin
  - channel:email
  - capability:find-work-emails
  - capability:enrich-contacts
  - capability:manage-crm
inputs:
  - name: champion_list
    description: names and previous companies of past champions
steps:
  - title: Detect the move
    tool: apollo/enrich-contacts
    instruction: For each person in `champion_list`, find their current company and title. Keep only people who moved in the last 6 months.
  - title: Size the new company
    tool: clay/enrich-contacts
    instruction: For each new company, add size, industry and funding stage.
  - title: Open a deal
    tool: attio/manage-crm
    instruction: Create a deal on the new company with the champion as the contact and the previous relationship in the notes.
doneWhen:
  - Every champion who moved has a deal on their new company.
  - The user has the list of moves.
featured: 10
updated: 2026-09-16
---
