---
title: Answer a GTM question with cited company docs
summary: Searches Notion and Confluence for the answer, drafts a cited response, posts it in Slack, and logs the gaps.
author: shipgtm
motion: outbound
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A cited answer, drawn only from your own docs, posted back in the channel the question came from.
- A plain "no source covers this" instead of a guess when nothing matches.
- Unanswered questions logged in Notion for the enablement team to fill.

## Inputs

- `question`: the question a rep asked, in their words, e.g. does the Enterprise plan support SSO?
- `question_channel`: the Slack channel to post the answer back to, e.g. #ask-gtm
- `gap_database`: the Notion database that tracks unanswered questions, e.g. GTM content gaps

## Steps

1. **Search Notion** with [notion/search-workspace](../companies/notion/tools/search-workspace.md). Search for `question`'s key terms across your enablement pages. Keep each matching page's title, URL and content.
2. **Search Confluence** with [atlassian/search-confluence](../companies/atlassian/tools/search-confluence.md). Search the same terms for content that lives there instead. Keep matching pages with their source and URL.
3. **Draft a cited answer** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Answer `question` strictly from the pages kept above, citing the source page for every claim. If nothing covers it, say so plainly rather than guessing.
4. **Post the answer** with [slack/post-message](../companies/slack/tools/post-message.md). Reply in `question_channel` with the answer and its citations, or the "no source covers this" note.
5. **Log the gap** with [notion/create-page](../companies/notion/tools/create-page.md). When no source covered `question`, add a row to `gap_database` with the question and `question_channel`, for the enablement team to write an answer.

## Notes

The answer is only as current as the pages it cites; keep `gap_database` reviewed so the next person asking the same question gets a real source instead of another gap.

Adapted from ShipGTM's [GTM knowledge base build guide](https://shipgtm.substack.com/p/agent-build-guide-gtm-knowledge-base).
