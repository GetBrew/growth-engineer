---
title: Turn recent meetings into notes and tracked action items
summary: Writes notes for each new meeting, adds missed action items in Bridge, and saves the notes to Notion.
author: Shahzaib0217
motion: retention
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- Notes for every meeting since the last run: summary, decisions, key takeaways and action items with owners.
- Any action item said in the meeting but missing from Bridge, added to that meeting once you approve it.
- One Notion page per meeting with its notes.

## Inputs

- `since`: when the last run happened, so only newer meetings are read, e.g. 2026-10-16
- `participant`: optionally, only meetings with this person or company, e.g. acme.com
- `notes_parent`: the Notion page or database the notes go in, e.g. Meeting notes

## Steps

1. **List the meetings** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Browse meetings from `since` to now, without a query, filtered on `participant` when given. Keep each `recapId`, title and date.
2. **Read each meeting** with [bridge/get-meeting-details](../companies/bridge/tools/get-meeting-details.md). For each `recapId`, keep the summary, takeaways, topics, action items and transcript. Skip meetings with no transcript, such as booked calls that never took place.
3. **Write the notes**. For each meeting, write a summary, the decisions made, three to five takeaways and every commitment heard in the transcript, with its owner and due date when said. Compare the commitments with the meeting's action items from step 2, and show the user the ones Bridge did not capture.
4. **Add what is missing** with [bridge/create-action-item](../companies/bridge/tools/create-action-item.md). Add each approved commitment to its meeting by `recapId`, with its owner.
5. **Save the notes** with [notion/create-page](../companies/notion/tools/create-page.md). Create one page per meeting under `notes_parent`, titled with the meeting title and date.

## Notes

Run it daily or weekly with `since` set to the previous run. Any docs tool can stand in for Notion in step 5, or skip it and keep the notes in Bridge.
