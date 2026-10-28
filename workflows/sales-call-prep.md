---
title: Prepare a brief and agenda before a sales call
summary: Gathers what Bridge remembers about the prospect, adds recent company news, generates a meeting brief and writes an agenda to the Notepad.
author: Shahzaib0217
motion: outbound
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A Bridge brief on the meeting with attendee profiles, past context and open action items.
- A one-page prep summary: who is coming, what was said before, recent company news and open questions.
- An agenda and discovery questions in the meeting's Notepad.

## Inputs

- `meeting`: the upcoming call, by title, attendee or day, e.g. Acme demo on Thursday
- `goal`: what you want from this call, e.g. agree on a two-week pilot
- `news_days`: how far back to look for company news, e.g. 90

## Steps

1. **Find the meeting** with [bridge/list-upcoming-meetings](../companies/bridge/tools/list-upcoming-meetings.md). Match `meeting` to one upcoming meeting and confirm it with the user. Keep its `recap_id`, start time and attendees.
2. **Look up the attendees** with [bridge/get-person](../companies/bridge/tools/get-person.md). For each external attendee, keep their title, company, the user's notes on them and their past meetings with the user.
3. **Look up the company** with [bridge/get-company](../companies/bridge/tools/get-company.md). For the prospect's company, keep its summary, industry, the user's notes and the other people Bridge knows there.
4. **Read past conversations** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Search transcripts for needs, objections, pricing and next steps, filtered on the attendees' names. Search always returns its closest matches, so keep only snippets from meetings with these attendees or that name the company.
5. **Check the news** with [exa/search-web](../companies/exa/tools/search-web.md). Search news about the company from the last `news_days` days. Keep up to three items worth raising, each with its link.
6. **Generate the brief** with [bridge/generate-meeting-brief](../companies/bridge/tools/generate-meeting-brief.md). Generate the brief for the meeting's `recap_id`. Keep its goal, context and open action items.
7. **Write the prep**. Draft a one-page summary from steps 2 to 6, then an agenda toward `goal` with three to five discovery questions. Show both to the user.
8. **Save the agenda** with [bridge/update-meeting-notepad](../companies/bridge/tools/update-meeting-notepad.md). Append the approved agenda and questions to the meeting's Notepad.

## Notes

A first call has no past meetings: steps 2 to 4 return little, and the brief and news carry the prep. Any web search tool works in step 5.
