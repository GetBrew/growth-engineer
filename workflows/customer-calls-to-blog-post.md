---
title: Draft a blog post from what customers ask on calls
summary: Reads recent Gong call transcripts, finds the question customers ask most, and saves a post answering it as a Webflow draft.
author: thedogwiththedataonit
motion: content
tags:
  - channel:website
updated: 2026-09-29
---

## Outcome

- The question customers asked most on your recent calls, and how many calls raised it.
- A blog post answering it, with no customer names, companies or quotes, saved as a draft in your Webflow blog.

## Inputs

- `since`: how far back to read calls, e.g. 30 days ago
- `blog_collection`: the Webflow CMS collection your blog posts live in, by name, e.g. Blog Posts

## Steps

1. **Read recent calls** with [gong/get-call-transcripts](../companies/gong/tools/get-call-transcripts.md). Request the transcripts with `fromDateTime` set to `since` and `toDateTime` set to now, following the `cursor` until none is returned. Keep each call's `callId` and its sentences.
2. **Find the question**. Across the transcripts, find the product questions customers ask, group the ones that mean the same thing, and pick the one raised on the most calls. Keep the question, how many calls raised it, and the answers your team gave.
3. **Write the post**. Draft a blog post that answers the question in full, building on the answers your team gave. Leave out every customer's name, company and words. Show the draft to the user, and keep the approved title, slug and body.
4. **Save the draft** with [webflow/create-cms-items](../companies/webflow/tools/create-cms-items.md). After the user approves, read the fields of `blog_collection`, then create one item in it with `isDraft` set to `true`, filling its name, slug and body from the approved post. Keep the item's ID.

## Notes

The post stays a draft: publish it from Webflow once someone has reviewed it. Transcripts can hold private details, so the post answers the question in your team's words, never a customer's.
