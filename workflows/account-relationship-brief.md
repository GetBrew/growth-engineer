---
title: Brief yourself on an account from every past conversation
summary: Pulls an account's people, meeting history, open commitments and topic timelines from Bridge into one brief with risks and next moves.
author: Shahzaib0217
motion: retention
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- An account brief: who you know there and their roles, how the relationship has gone, and what each side still owes.
- How each topic you track has moved across meetings, with what was decided.
- The deal or renewal risks found, each with the meeting it came from and a suggested next move.

## Inputs

- `account`: the company, by name or domain, e.g. acme.com
- `topics`: what to trace across meetings, e.g. pricing, security review, rollout
- `lookback_days`: how far back to read, e.g. 180

## Steps

1. **Find the account** with [bridge/search-companies](../companies/bridge/tools/search-companies.md). Match `account` and confirm it with the user if several match. Keep the company's id. If Bridge has no record of it yet, skip steps 2 and 3 and use the people from step 4.
2. **Read the account** with [bridge/get-company](../companies/bridge/tools/get-company.md). Keep its summary, industry, the user's notes and the people Bridge knows there.
3. **Map the people** with [bridge/get-person](../companies/bridge/tools/get-person.md). For each person at the account, keep their title, the user's notes, how many meetings they joined and when they last met.
4. **Find the meetings** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Search the last `lookback_days` days for `account` and its people's names. Keep each meeting's `recapId`, title, date and the participants outside your company.
5. **Trace each topic** with [bridge/get-topic-timeline](../companies/bridge/tools/get-topic-timeline.md). For each of `topics`, filtered on the names of the account's people from steps 3 and 4, keep the meetings in order with what was said first, what changed and what was decided. Drop moments that are not about the account.
6. **List open commitments** with [bridge/search-action-items](../companies/bridge/tools/search-action-items.md). Search open action items from the last `lookback_days` days with `scope` all and `types` explicit and created, and keep those that mention the account or its people. Keep each item, its owner and its meeting.
7. **Write the brief**. Combine steps 2 to 6 into a one-page brief: stakeholders and their stance, relationship history, open commitments by side, topic timelines, risks (a champion gone quiet, a slipped commitment, a competitor named) and three next moves.

## Notes

Bridge only knows the meetings it recorded or joined, so a quiet account may simply meet elsewhere. To put the brief in front of the next meeting, append its summary to that meeting's Notepad with `bridge/update-meeting-notepad`.
