---
title: Email companies whose job posts show they need your product
summary: Finds new job posts for roles you support with Exa, checks each for a real need or a competitor with Jev, and emails the hiring team.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every job post found, with the company, the role, whether it signals a need, the competitor it names and Jev's confidence.
- The buyer at each company with a real need, with their work email.
- An approved opening line for each buyer that points to the job post, queued in your lemlist campaign, or in your switching campaign when the post names a competitor.

## Inputs

- `role_queries`: the job posts that signal a need, as searches, e.g. hiring first revenue operations manager; SDR team lead job
- `category`: what your product does, in a buyer's words, e.g. sales engagement software
- `competitors`: the tools a job post might name that you replace, e.g. Outreach, Salesloft
- `job_boards`: the job board domains to search, e.g. greenhouse.io, lever.co, ashbyhq.com
- `lookback_days`: how recent a post counts, e.g. 14
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `buyer_titles`: who to email at each company, e.g. VP Sales, Head of Revenue Operations
- `max_lookups`: the most company domains to search for a buyer in one run, since each search spends Hunter credits, e.g. 50
- `campaign`: the lemlist campaign that sends the emails, set up once with a `job_post_line` custom variable, e.g. Hiring signal
- `switch_campaign`: the lemlist campaign for buyers whose post names a competitor, with copy about switching and the same `job_post_line` variable, e.g. Hiring signal: switching

## Steps

1. **Find job posts** with [exa/search-web](../companies/exa/tools/search-web.md). Search each of `role_queries` on `job_boards`, published in the last `lookback_days`, with each page's text. Keep each post's URL, job title, company name, the company's own website domain when the post shows it, and the text; drop duplicates.
2. **Read each post** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the job title and text as the state, with a choice `signal` of exact (the role that uses `category` or that `category` would replace), adjacent (a role that works alongside `category`) and generic (a general hiring push unrelated to `category`), a noul `names_category` (the post says the team will buy, build or run `category`), and a choice `competitor` over `competitors` plus none. Keep every answer with its confidence or probability.
3. **Keep the real needs**. Keep the posts whose signal is exact or whose `names_category` is yes, one per company. Show the user the posts whose signal or competitor confidence is below `min_confidence` or whose `names_category` is unsure, and keep what the user decides.
4. **Find the domains** with [exa/search-web](../companies/exa/tools/search-web.md). For each kept company whose post showed no domain, search company pages for its name. Keep the domains you can confirm, and drop the companies you can't.
5. **Find the buyer** with [hunter/search-domain](../companies/hunter/tools/search-domain.md). Search each kept company's domain, up to `max_lookups`. Keep the person whose position best matches `buyer_titles`, with their name, position and email; list the companies with no match.
6. **Write the opening lines**. Draft one sentence per buyer that names the role they are hiring for and the problem it hints at, with no pitch. Show the lines to the user.
7. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each buyer whose post named a competitor to `switch_campaign`, and every other buyer to `campaign`, with their approved line in `job_post_line`.

## Notes

The line points at the role the company is hiring for, not at your product; the campaign's own copy makes the pitch. Keep `switch_campaign` about what changes when a team moves off the competitor.

Run it weekly with `lookback_days` set to 7 so each post is seen once.
