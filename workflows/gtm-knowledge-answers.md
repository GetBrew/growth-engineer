---
title: Answer a GTM question from Notion, Slack and HubSpot
summary: Searches your docs, past conversations and CRM for the answer, drafts a cited response with Claude, and posts it back in Slack.
author: shipgtm
motion: outbound
tags:
  - channel:chat
added: 2026-09-30
updated: 2026-09-29
---

## Outcome

- A cited answer, drawn only from Notion, Slack and HubSpot, posted back in the channel the question came from.
- A plain "no source covers this" instead of a guess when nothing matches.
- Unanswered questions logged in Notion for the team to fill.

## Inputs

- `question`: the question a rep asked, in their words, e.g. does the Enterprise plan support SSO?
- `question_channel`: the Slack channel to post the answer back to, e.g. #ask-gtm
- `gap_database`: the Notion database that tracks unanswered questions, e.g. GTM content gaps

## Steps

1. **Search Notion** with [notion/search-workspace](../companies/notion/tools/search-workspace.md). Search for `question`'s key terms across your enablement pages. Keep each matching page's title, URL and content.
2. **Search Slack** with [slack/search-messages](../companies/slack/tools/search-messages.md). Search the same terms for past discussion that already answered this. Keep matching messages with their channel and permalink.
3. **Search the CRM** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). When `question` names an account or deal, search for the matching record. Keep whatever properties or notes bear on the question.
4. **Draft a cited answer** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Answer `question` strictly from what steps 1 to 3 returned, citing the source for every claim. If nothing covers it, say so plainly rather than guessing.
5. **Post the answer** with [slack/post-message](../companies/slack/tools/post-message.md). Reply in `question_channel` with the answer and its citations, or the "no source covers this" note.
6. **Log the gap** with [notion/create-page](../companies/notion/tools/create-page.md). When no source covered `question`, add a row to `gap_database` with the question and `question_channel`, for the team to write an answer.

## Notes

The answer is only as current as the pages, threads and records it cites; keep `gap_database` reviewed so the next person asking the same question gets a real source instead of another gap.

Adapted from ShipGTM's [GTM knowledge base build guide](https://shipgtm.substack.com/p/agent-build-guide-gtm-knowledge-base), which names Slack and Notion as its two core sources with HubSpot's CRM data ingested alongside them.
