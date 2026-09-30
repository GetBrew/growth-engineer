---
title: Build a cited content cluster from one pillar topic
summary: Researches subtopics for a pillar keyword, drops existing pages, drafts briefs, and publishes what you approve.
author: shipgtm
motion: content
tags:
  - channel:website
updated: 2026-09-29
---

## Outcome

- A prioritized list of cluster subtopics with intent, ranking potential and evidence.
- A source-backed brief for each subtopic, ready for review.
- The approved briefs live in your CMS collection.

## Inputs

- `pillar_topic`: the pillar keyword to cluster, e.g. outbound sales automation
- `own_domain`: your site, to skip subtopics you already cover, e.g. acme.com
- `cms_collection`: the Webflow CMS collection to draft posts into, e.g. Blog posts

## Steps

1. **Research subtopics** with [perplexity/deep-research](../companies/perplexity/tools/deep-research.md). Research `pillar_topic` for the questions and subtopics people search around it. Keep every subtopic with its intent.
2. **Check for overlap** with [firecrawl/map-site](../companies/firecrawl/tools/map-site.md). Map `own_domain`. Drop any subtopic that already has a live page there; keep the nearby pages' URLs for internal linking.
3. **Check ranking potential** with [exa/search-web](../companies/exa/tools/search-web.md). Search each remaining subtopic. Keep the subtopics whose top results are beatable, with their top pages for reference, and drop the ones dominated by much larger sites.
4. **Prioritize the cluster**. Order the kept subtopics by business value, their internal-link role to `pillar_topic`, and the evidence gathered above.
5. **Draft the briefs**. For each subtopic, in priority order, draft a source-backed brief with a distinct angle, the reader's outcome, a heading structure, and links to `pillar_topic` and the pages kept in step 2. Show the drafts to the user.
6. **Stage approved briefs** with [webflow/create-cms-items](../companies/webflow/tools/create-cms-items.md). After the user approves, create each brief as a draft item in `cms_collection`.
7. **Publish them** with [webflow/publish-cms-items](../companies/webflow/tools/publish-cms-items.md). Publish the items the user is ready to take live now; leave the rest staged.

## Notes

Adapted from ShipGTM's [topical cluster guide](https://shipgtm.substack.com/p/speedrun-to-1000-visitors-a-month).
