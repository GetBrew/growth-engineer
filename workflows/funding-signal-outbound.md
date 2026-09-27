---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
featured: 1
updated: 2026-09-16
---

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `sender_email`: the address emails are sent from

## Steps

1. **Find funded companies** with [clay/build-audience](../companies/clay/tools/build-audience.md). List companies matching `target_segment` that announced a round in the last 30 days. Keep name, domain, round and amount.
2. **Find the buyer** with [apollo/find-work-emails](../companies/apollo/tools/find-work-emails.md). For each company, find the head of growth or marketing. Keep their name, title and work email; skip companies with no match.
3. **Write emails** with [brew/write-copy](../companies/brew/tools/write-copy.md). Draft a three-sentence email per contact: congratulate the round, name one thing they will now have budget for, ask one question. Show the drafts to the user.
4. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). After the user approves, send each email from `sender_email`.

## Done when

- Every funded company has a contact, or a note explaining why not.
- Approved emails are sent, and the user has a summary table.
