---
title: Track and improve brand citations in AI answers
summary: Measure citation performance, find gaps in the answers buyers see, and draft content improvements with a repeatable measurement plan.
author: nicklafferty
motion: content
tags:
  - channel:website
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A citation report for your brand against the prior window, kept separate from brand visibility, with the organization, category, dates and settings used.
- Drafted refreshes or new-page briefs for your top pages, each with its evidence, source-backed copy, a target page and an editorial handoff.
- A change log that separates proposed changes from verified publication and says when to measure again.
- On a repeat run, the outcome for each shipped change, without claiming publication alone caused it.

## Inputs

- `organization_name`: the Profound organization to use
- `category_name`: the existing tracked category covering the brand's market
- `brand_name`: the tracked brand name to measure
- `owned_domains`: the brand's domains, including any alternate domains to count
- `competitor_names`: tracked competitors to compare with the brand
- `end_date`: the last complete day of the current measurement window, in YYYY-MM-DD
- `window_days`: the number of days in each comparison window, e.g. 14
- `max_answers`: the maximum raw answers to inspect per run, e.g. 100
- `max_pages`: the maximum pages to prioritize for improvement, e.g. 5
- `approved_source_material`: current page text and approved product facts, research and brand guidance for drafting, with source URLs or filenames
- `previous_run`: the prior report and change log, including published URLs and dates, or none for the first run

## Steps

1. **Find the organization** with [profound/list-organizations](../companies/profound/tools/list-organizations.md). Match `organization_name` to an accessible organization; ask the user to resolve ambiguous matches. Keep its ID as `org_id`.
2. **Choose the tracked category** with [profound/list-categories](../companies/profound/tools/list-categories.md). Pass `org_id` and match `category_name`. If it is missing, report that category and prompt setup is needed in Profound before this workflow can run. Keep `category_id`.
3. **Establish citation performance** with [profound/get-citations-report](../companies/profound/tools/get-citations-report.md). Derive two adjacent, non-overlapping windows of `window_days`, ending the current window at `end_date`; both endpoints are inclusive. For each window, pass `category_id`, the dates, scope all, metrics count and citation_share, and analysis_type_filter visibility. Omit group_by to get domain rows and exhaust info.next_cursor. Match rows against `owned_domains`, sum their counts and citation shares, and calculate the share change in percentage points as (current share minus prior share) times 100. Keep dates, request parameters, domain rows, returned metadata and the two owned-domain totals.
4. **Separate mentions from citations** with [profound/get-visibility-report](../companies/profound/tools/get-visibility-report.md). Query both saved windows with `category_id`, scope all, assets containing `brand_name` and `competitor_names`, and metrics visibility_score and share_of_voice. Repeat with group_by prompt to locate weak prompts, following info.next_cursor. Multiply decimal scores by 100 for percentage display. Keep brand comparisons, prompt IDs and scores separately from citation performance.
5. **Find pages to improve** with [profound/get-citations-report](../companies/profound/tools/get-citations-report.md). Query both saved windows with the same analysis type, scope all and group_by [page]; omit domain_filter. Exhaust info.next_cursor before matching owned URLs locally and comparing them with other cited pages. Prioritize up to `max_pages` owned pages losing citations or gaps where other pages attract citations. Keep exact URLs, counts, shares, ranks and the evidence for each priority.
6. **Inspect the answers behind the gaps** with [profound/get-prompt-answers](../companies/profound/tools/get-prompt-answers.md). Use `category_id`, the current window and prompt_id from the weak prompts. Page with limit and offset until reaching a total of `max_answers` across prompts or exhausting the answers. Read what buyers are told, flag unanswered questions or claims to verify, and distinguish a brand mention from a link citing an owned page. Keep prompt IDs, available model and date details, relevant excerpts, returned source URLs and the actual sample size. Label this inspection as a bounded sample.
7. **Draft specific improvements**. Use the saved evidence and `approved_source_material` to draft up to `max_pages` refreshes or new-page briefs. Give each a target URL or proposed page, the buyer question it answers, exact proposed copy, supporting sources and an expected measurable outcome. Mark missing facts for review; treat inaccessible cited pages as research leads. Prioritize useful answers, original evidence and accurate product details. Keep the drafts and an experiment log linking each proposal to its baseline, evidence and owner to assign.
8. **Plan publication and measurement**. Show the drafts for editorial review and hand them to the user's publishing process. Record the actual published URL and date only when supplied or verified; leave unshipped proposals pending. Set the next comparison after a complete `window_days` window following publication. On subsequent runs, use `previous_run` to report page-level citation-share changes and raw counts for shipped pages alongside brand-level mention visibility, with unchanged pages as a comparison where available. Keep the report, query settings, drafts and change log for the next run.

## Notes

This workflow uses Profound's hosted MCP and existing tracked prompts. AI Marketer (Aim) and Profound Agents can help teams execute the resulting briefs inside Profound; the calls above retrieve data, and this workflow prepares drafts for the team's publishing process.

Citation share measures a domain's share of citations and is averaged per model. It is different from the percentage of answers mentioning a brand. Keep the same tracked prompts, models, regions and category configuration between windows; record changes and avoid interpreting a changed sample as lift. Empty or incomplete data is unknown, not zero. Never infer a whole-category rate from the bounded answer sample.

Run again after the measurement window, supplying the saved report and publication log as `previous_run`. Keep a separate baseline for material tracking changes. Citation gains are an experiment outcome, not a guarantee; content age alone does not establish why a page gained or lost citations.
