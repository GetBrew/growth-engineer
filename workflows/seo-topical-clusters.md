---
title: Build a cited content cluster from one pillar topic
summary: Researches subtopics with Exa, drafts briefs, publishes the approved ones in Webflow, and schedules the next batch in n8n.
author: shipgtm
motion: content
tags:
  - channel:website
updated: 2026-09-29
---

## Outcome

- A prioritized list of cluster subtopics with intent, ranking potential and evidence.
- A source-backed brief for each subtopic, ready for review.
- The approved briefs live in your CMS collection, with the next batch scheduled.

## Inputs

- `pillar_topic`: the pillar keyword to cluster, e.g. outbound sales automation
- `cms_collection`: the Webflow CMS collection to draft posts into, e.g. Blog posts
- `batch_workflow`: the n8n workflow that reruns this pipeline for the next batch, e.g. SEO cluster batch

## Steps

1. **Research subtopics** with [exa/answer-question](../companies/exa/tools/answer-question.md). Ask what people search and ask around `pillar_topic`. Keep every subtopic with its intent and the citations behind it.
2. **Check ranking potential** with [exa/search-web](../companies/exa/tools/search-web.md). Search each subtopic. Keep the ones whose top results are beatable, with their top pages for reference, and drop the ones dominated by much larger sites.
3. **Prioritize the cluster**. Order the kept subtopics by business value, their internal-link role to `pillar_topic`, and the evidence gathered above.
4. **Draft the briefs**. For each subtopic, in priority order, draft a source-backed brief with a distinct angle, the reader's outcome, a heading structure, and a link to `pillar_topic` and to the other briefs in the cluster. Show the drafts to the user.
5. **Stage approved briefs** with [webflow/create-cms-items](../companies/webflow/tools/create-cms-items.md). After the user approves, create each brief as a draft item in `cms_collection`.
6. **Publish them** with [webflow/publish-cms-items](../companies/webflow/tools/publish-cms-items.md). Publish the items the user is ready to take live now; leave the rest staged.
7. **Schedule the next batch** with [n8n/run-workflow](../companies/n8n/tools/run-workflow.md). Trigger `batch_workflow` with the subtopics left over from step 3, so the next run picks up where this one stopped.

## Notes

Step 7 needs `batch_workflow` already built and enabled for MCP access in n8n; this run only starts it.

Adapted from ShipGTM's [topical cluster guide](https://shipgtm.substack.com/p/speedrun-to-1000-visitors-a-month), which names Exa for research, Webflow for publishing and n8n as one option for orchestrating the pipeline.
