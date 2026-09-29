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
- An approved opening line for each buyer that points to the job post, queued in your lemlist campaign.

## Inputs

- `role_queries`: the job posts that signal a need, as searches, e.g. hiring first revenue operations manager; SDR team lead job
- `category`: what your product does, in a buyer's words, e.g. sales engagement software
- `competitors`: the tools a job post might name that you replace, e.g. Outreach, Salesloft
- `job_boards`: the job board domains to search, e.g. greenhouse.io, lever.co, ashbyhq.com
- `lookback_days`: how recent a post counts, e.g. 14
- `min_confidence`: the confidence below which you judge a post yourself, e.g. 0.7
- `buyer_titles`: who to email at each company, e.g. VP Sales, Head of Revenue Operations
- `max_enrichments`: the most people to enrich in one run, since each match costs an Apollo credit, e.g. 50
- `campaign`: the lemlist campaign that sends the emails, set up once with a `job_post_line` custom variable, e.g. Hiring signal

## Steps

1. **Find job posts** with [exa/search-web](../companies/exa/tools/search-web.md). Search each of `role_queries` on `job_boards`, published in the last `lookback_days`, with each page's text. Keep each post's URL, job title, company name, the company's own website domain when the post shows it, and the text; drop duplicates.
2. **Read each post** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send the job title and text as the state, with a choice `signal` of exact (the role your product serves or replaces), adjacent (a role that works with it) and generic (a general hiring push), a noul `names_category` (the team will buy, build or run `category`), and a choice `competitor` over `competitors` plus none. Keep every answer with its confidence or probability.
3. **Keep the real needs**. Keep the posts whose signal is exact, or whose `names_category` is likely, one per company. Show the user the posts whose `signal` confidence is below `min_confidence`, and keep the ones the user confirms.
4. **Find the domains** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each kept company whose post showed no website domain, look the company up by name. Keep its domain.
5. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). Search each kept company's domain for `buyer_titles`. Keep the best match's name, title and LinkedIn URL.
6. **Get their emails** with [apollo/bulk-enrich-people](../companies/apollo/tools/bulk-enrich-people.md). Enrich up to `max_enrichments` buyers, ten per call. Keep the work emails; list who has none.
7. **Write the opening lines**. Draft one sentence per buyer that names the role they are hiring for and the problem it hints at, and, when a competitor is named, how you differ. No pitch in the first line. Show the lines to the user.
8. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each buyer to `campaign` with their approved line in `job_post_line`.

## Notes

A job post is the company describing its problem in its own words, and while the role is open the team is still deciding how to solve it. A post that names a competitor is a displacement play: your line should say what changes when they switch, not that they should.

Run it weekly with `lookback_days` set to 7 so each post is seen once.
