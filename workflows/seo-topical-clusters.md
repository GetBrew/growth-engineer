---
title: Build a cited content cluster from one pillar topic
summary: Researches subtopics with Exa, scores them with Ahrefs, publishes the approved briefs in Webflow, and schedules the next batch in n8n.
author: shipgtm
motion: content
tags:
  - channel:website
added: 2026-09-30
updated: 2026-09-29
---

## Outcome

- A prioritized list of cluster subtopics with intent, ranking potential and search volume.
- A source-backed brief for each subtopic, ready for review.
- The approved briefs live in your CMS collection, with the next batch scheduled.

## Inputs

- `pillar_topic`: the pillar keyword to cluster, e.g. outbound sales automation
- `own_domain`: your site, to skip subtopics you already rank for, e.g. acme.com
- `cms_collection`: the Webflow CMS collection to draft posts into, e.g. Blog posts
- `batch_workflow`: the n8n workflow that reruns this pipeline for the next batch, e.g. SEO cluster batch

## Steps

1. **Research subtopics** with [exa/answer-question](../companies/exa/tools/answer-question.md). Ask what people search and ask around `pillar_topic`. Keep every subtopic with its intent and the citations behind it.
2. **Check what you already rank for** with [ahrefs/get-organic-keywords](../companies/ahrefs/tools/get-organic-keywords.md). Look up `own_domain`. Drop any subtopic that already ranks there, keeping the rest.
3. **Check volume and difficulty** with [ahrefs/get-keyword-overview](../companies/ahrefs/tools/get-keyword-overview.md). Look up the remaining subtopics. Drop the ones with too little search volume or too high a difficulty to be worth a brief, and keep the rest with their volume and difficulty.
4. **Prioritize the cluster**. Order the kept subtopics by business value, their internal-link role to `pillar_topic`, and the volume and difficulty from step 3.
5. **Draft the briefs**. For each subtopic, in priority order, draft a source-backed brief with a distinct angle, the reader's outcome, a heading structure, and a link to `pillar_topic` and to the other briefs in the cluster. Show the drafts to the user.
6. **Stage approved briefs** with [webflow/create-cms-items](../companies/webflow/tools/create-cms-items.md). After the user approves, create each brief as a draft item in `cms_collection`.
7. **Publish them** with [webflow/publish-cms-items](../companies/webflow/tools/publish-cms-items.md). Publish the items the user is ready to take live now; leave the rest staged.
8. **Schedule the next batch** with [n8n/run-workflow](../companies/n8n/tools/run-workflow.md). Trigger `batch_workflow` with the subtopics left over from step 4, so the next run picks up where this one stopped.

## Notes

Step 8 needs `batch_workflow` already built and enabled for MCP access in n8n; this run only starts it.

Adapted from ShipGTM's [topical cluster guide](https://shipgtm.substack.com/p/speedrun-to-1000-visitors-a-month), which names Exa for research, Ahrefs for keyword and ranking data, Webflow for publishing, and n8n as one option for orchestrating the pipeline.
