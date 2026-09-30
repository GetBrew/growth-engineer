---
title: Find Reddit and HN threads where buyers ask for a tool
summary: Searches Reddit and Hacker News with Exa, keeps the posts where someone is shopping for your category with Jev, and sends them to Slack.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:chat
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of every post found, with whether its author is shopping, what kind of post it is, the competitor it names and Jev's probability.
- A Slack post for each thread worth answering, with its link and a drafted reply for a person to post, and the unsure threads in one list.

## Inputs

- `category`: what you sell, in the words buyers use, e.g. cold email software
- `keywords`: searches that find candidate posts, e.g. cold email tool recommendation; alternative to Instantly; best tool for sending cold email
- `competitors`: the tools posts might name, e.g. Instantly, Smartlead, lemlist
- `lookback_days`: how recent a post counts, e.g. 7
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `disclosure`: who is replying and their tie to your product, said in every reply, e.g. I'm Sam, and I work on Acme Mail
- `product_facts`: what a reply may say about your product and the tools around it, e.g. prices, limits and the alternatives you'd point people to
- `alerts_channel`: the Slack channel the threads go to, e.g. #community-leads

## Steps

1. **Find candidate posts** with [exa/search-web](../companies/exa/tools/search-web.md). Search each of `keywords` on reddit.com and news.ycombinator.com, published in the last `lookback_days`, with each page's text. Keep each post's URL, title, text and date; drop duplicates.
2. **Keep the shoppers** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each post's title and text as the state, with a noul `shopping` (true: the author is choosing or replacing a tool for `category`; false: using one happily, sharing news, promoting their own product or hiring), a choice `kind` of recommendation_request, competitor_complaint, comparison, pain_point, question and other, and a choice `competitor` over `competitors` plus none. Keep the posts whose `shopping` is yes, with their kind and competitor, and list the unsure ones apart.
3. **Draft the replies**. For each kept post, draft a reply that answers what the author asked in their own terms, includes `disclosure`, and names alternatives where they fit better, using only `product_facts` and the thread and leaving a [fill in] where a draft needs anything else. No links unless the thread asks for them. Show the drafts to the user.
4. **Send them to the team** with [slack/post-message](../companies/slack/tools/post-message.md). Post each kept thread to `alerts_channel` with its link, kind, competitor, the `shopping` probability and the drafted reply, most likely shoppers first, then the unsure threads in one message.

## Notes

A person posts every reply, from their own account, after reading the thread and the community's rules on self-promotion; write it to help the author, not to pitch. The keyword search in step 1 can stay broad, because Jev reads every match and keeps only the shoppers.

Run it daily with `lookback_days` set to 1.
