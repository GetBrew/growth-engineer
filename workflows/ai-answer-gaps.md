---
title: Plan articles for AI answers that leave you out
summary: Lists the prompts where AI engines name your competitors but not you in Notra, picks the biggest gaps, and plans a brief for each.
author: thedogwiththedataonit
motion: content
tags:
  - channel:website
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of the tracked prompts where AI engines name competitors but not you, with the engines, the competitors and the opportunity for each.
- A content brief in Notra for each gap you chose, waiting for your approval to start the writer.

## Inputs

- `project`: the Notra GEO project to read, by name, e.g. Acme
- `max_briefs`: the most briefs to plan in one run, since each one uses AI credits, e.g. 3

## Steps

1. **List the gaps** with [notra/list-content-gaps](../companies/notra/tools/list-content-gaps.md). Read the gaps for `project`. If `hasScanData` is false, tell the user to run a scan in Notra first and stop. Keep each prompt gap's `id`, prompt, engines, competitors and `opportunity`, leaving out the ones marked `won` or that already have a brief.
2. **Pick the biggest gaps**. Order the gaps by `opportunity`, highest first, and show them to the user as a table. Keep the ones they choose, at most `max_briefs`.
3. **Plan the briefs** with [notra/plan-content-brief](../companies/notra/tools/plan-content-brief.md). For each chosen gap, plan a brief with `topic` set to the gap's prompt, `sourceKind` set to `gap` and `sourceId` set to its `id`, leaving `autoApprove` off. Keep each brief's `briefId` and status.

## Notes

Gaps come from Notra's latest scans, so run this after a scan. Approving a brief in Notra starts its writer, which drafts the article.
