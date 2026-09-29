---
title: Qualify accounts against your ICP before buying contacts
summary: Lists companies with Hunter, reads each homepage with Firecrawl, checks fit and business model with Jev, and finds buyers at the fits only.
author: thedogwiththedataonit
motion: outbound
updated: 2026-09-29
---

## Outcome

- A table of every company checked, with its fit level, business model, sales motion and Jev's confidence.
- The companies that fit, with the reason each one passed, and the ones that didn't, with the reason they failed.
- The buyers at each company that fits, from a search that spends no credits, ready to enrich.

## Inputs

- `target_segment`: the companies to start from, in plain words, e.g. B2B software companies in the US with 50 to 500 employees
- `ideal_customer`: what a company that fits looks like, in a sentence or two, e.g. sells software to other businesses, has a sales team and a self-serve free trial
- `max_companies`: the most homepages to read in one run, since each read costs Firecrawl credits, e.g. 200
- `min_confidence`: the confidence below which you judge a company yourself, e.g. 0.75
- `buyer_titles`: the people to find at each company that fits, e.g. VP Marketing, Head of Growth

## Steps

1. **List candidates** with [hunter/search-companies](../companies/hunter/tools/search-companies.md). Search for `target_segment` and keep up to `max_companies` companies, with each one's name and domain.
2. **Read each homepage** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Scrape each domain's homepage as markdown. Keep the page text, and note the domains that fail to load or redirect elsewhere.
3. **Qualify** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each homepage's text as the state, with a score `fit` against `ideal_customer` on four levels (no fit, weak, good, ideal), a choice `business_model` of b2b_software, b2b_services, b2c, marketplace, agency and other, a choice `sales_motion` of self_serve (sign-up and prices on the site), sales_led (demo or contact sales only) and hybrid, and a noul `active_business` (a live product, not a parked, acquired or shut-down site). Keep every answer with its confidence or probability.
4. **Settle the unsure ones**. Show the user every company whose `fit` confidence is below `min_confidence`, with its homepage's first lines, and keep the level the user picks. Keep the companies scored good or ideal that are active businesses.
5. **Find the buyers** with [apollo/search-people](../companies/apollo/tools/search-people.md). Search each company that fits for `buyer_titles`. Keep each person's name, title, company and LinkedIn URL.

## Notes

Qualify first and enrich second: an email lookup costs a credit whether or not the company fits, while Jev is billed only for the tokens it reads. A data provider's industry code can miss what a company actually sells, which is why the fit is read from what the company says about itself.

Read the fit by its most likely level, and rank companies within a level by the probability of good and ideal together; TypeSafe's docs warn against reading the expected score between two levels as a magnitude. A probability for every level also sidesteps a common complaint about prompted scores, where every company lands between 70 and 80.
