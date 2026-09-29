---
title: Check drafts against your style guide before they publish
summary: Reads drafts marked ready in your Notion content calendar, checks each against your style rules with Jev, and flags the ones that fail.
author: thedogwiththedataonit
motion: content
tags:
  - channel:chat
updated: 2026-09-29
---

## Outcome

- A table of each draft with every rule it passed or failed and Jev's probability for each.
- Each draft's status set to passed or needs edits in Notion, with its failed rules in its style-checks property.
- A Slack post listing the drafts that need edits and why.

## Inputs

- `calendar`: the Notion content calendar database, by name, e.g. Content calendar
- `ready_status`: the status that marks a draft ready for review, e.g. Ready for review
- `rules`: your style rules, one line each, e.g. Every claim with a number links its source; The headline promises only what the body delivers; No more than one call to action; No competitor is named in a negative way
- `passed_status`: the status a draft moves to when it passes every rule, e.g. Approved
- `failed_status`: the status a draft moves to when it fails one, e.g. Needs edits
- `checks_property`: the text property that lists a draft's failed rules, created once, e.g. Style checks
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `writers_channel`: the Slack channel the writers watch, e.g. #content

## Steps

1. **Find the calendar** with [notion/search-workspace](../companies/notion/tools/search-workspace.md). Search for `calendar`. Keep its data source ID and the names of its status and author properties.
2. **Find the drafts** with [notion/query-data-source](../companies/notion/tools/query-data-source.md). Query the calendar for pages whose status is `ready_status`. Keep each page's ID, title and author.
3. **Read them** with [notion/read-page](../companies/notion/tools/read-page.md). Keep each draft's text.
4. **Check every rule** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each draft's title and text as the state, with one noul per line of `rules`, asking whether the draft meets it. Keep each rule's probability: a rule passes when its answer is yes and fails when it is no.
5. **Point to the problems**. Show the user the rules whose answer is unsure, and keep what the user decides. For each failed rule, find the sentence in the draft that breaks it, and show the user the drafts, their failed rules and those sentences.
6. **Update the calendar** with [notion/update-page](../companies/notion/tools/update-page.md). After the user approves, set each draft's status to `passed_status` or `failed_status`, write its failed rules and sentences in `checks_property` in under 2,000 characters, and clear `checks_property` on the drafts that pass.
7. **Tell the writers** with [slack/post-message](../companies/slack/tools/post-message.md). Post the drafts that need edits to `writers_channel` with their authors and failed rules.

## Notes

One yes-or-no question per rule keeps each check narrow, and all of a draft's rules go in one request, so adding a rule adds little time or cost. Write each rule as something a careful editor could judge in a second; a rule like "sounds on-brand" is too vague to check.

Jev checks; it does not rewrite. The writer, or an agent you trust, fixes the sentences step 5 points to, and the draft goes back to `ready_status` for another pass.
