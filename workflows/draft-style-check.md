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
- Each draft's status set to passed or needs edits in Notion, with the failed rules written on the page.
- A Slack post listing the drafts that need edits and why.

## Inputs

- `calendar`: the Notion content calendar database, by name, e.g. Content calendar
- `ready_status`: the status that marks a draft ready for review, e.g. Ready for review
- `rules`: your style rules, one line each, e.g. Every claim with a number links its source; The headline promises only what the body delivers; No more than one call to action; No competitor is named in a negative way
- `passed_status`: the status a draft moves to when it passes every rule, e.g. Approved
- `failed_status`: the status a draft moves to when it fails one, e.g. Needs edits
- `checks_property`: the text property that lists a draft's failed rules, created once, e.g. Style checks
- `min_probability`: how likely a rule must be met to count as passed, e.g. 0.8
- `writers_channel`: the Slack channel the writers watch, e.g. #content

## Steps

1. **Find the drafts** with [notion/query-data-source](../companies/notion/tools/query-data-source.md). Query `calendar` for pages whose status is `ready_status`. Keep each page's ID, title and author.
2. **Read them** with [notion/read-page](../companies/notion/tools/read-page.md). Keep each draft's text.
3. **Check every rule** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each draft's title and text as the state, with one noul per line of `rules`, asking whether the draft meets it, and a noul `headline_matches_body`. Keep each rule's probability; a rule below `min_probability` fails.
4. **Point to the problems**. For each failed rule, find the sentence in the draft that breaks it. Show the user the drafts, their failed rules and those sentences.
5. **Update the calendar** with [notion/update-page](../companies/notion/tools/update-page.md). After the user approves, set each draft's status to `passed_status` or `failed_status`, and write its failed rules and sentences in `checks_property`.
6. **Tell the writers** with [slack/post-message](../companies/slack/tools/post-message.md). Post the drafts that need edits to `writers_channel` with their authors and failed rules.

## Notes

One yes-or-no question per rule keeps each check narrow, and all of a draft's rules go in one request, so adding a rule adds little time or cost. Write each rule as something a careful editor could judge in a second; a rule like "sounds on-brand" is too vague to check.

Jev checks; it does not rewrite. The writer, or an agent you trust, fixes the sentences step 4 points to, and the draft goes back to `ready_status` for another pass.
