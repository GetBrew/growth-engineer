---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: thedogwiththedataonit
version: 1
tags:
  - motion:outbound
  - channel:email
  - capability:enrich-contacts
  - capability:find-work-emails
  - capability:send-email
inputs:
  - name: target_segment
    description: the kind of company to watch
    example: Series A B2B SaaS in the US
  - name: sender_email
    description: the address emails are sent from
steps:
  - title: Find funded companies
    tool: clay/build-audience
    instruction: List companies matching `target_segment` that announced a round in the last 30 days. Keep name, domain, round and amount.
  - title: Find the buyer
    tool: apollo/find-work-emails
    instruction: For each company, find the head of growth or marketing. Keep their name, title and work email; skip companies with no match.
  - title: Write emails
    tool: brew/write-copy
    instruction: "Draft a three-sentence email per contact: congratulate the round, name one thing they will now have budget for, ask one question. Show the drafts to the user."
  - title: Send
    tool: brew/send-email
    instruction: After the user approves, send each email from `sender_email`.
doneWhen:
  - Every funded company has a contact, or a note explaining why not.
  - Approved emails are sent, and the user has a summary table.
featured: 1
updated: 2026-09-16
---
