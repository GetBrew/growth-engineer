---
title: Qualify accounts against your ICP before buying contacts
summary: Lists companies with Hunter, reads each homepage with Firecrawl, checks fit and business model with Jev, and finds buyers at the fits only.
author: thedogwiththedataonit
motion: outbound
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of every company checked, with its fit level, business model, sales motion and Jev's confidence.
- The companies that fit, and for each one that didn't, the answer that ruled it out.
- The buyers at each company that fits, from a search that spends no credits, ready to enrich.

## Inputs

- `target_segment`: the companies to start from, in plain words, e.g. B2B software companies in the US with 50 to 500 employees
- `ideal_customer`: what a company that fits looks like, in a sentence or two, e.g. sells software to other businesses, has a sales team and a self-serve free trial
- `max_companies`: the most companies to check in one run, e.g. 100; Hunter returns up to 100 per search, and paging past them needs a Premium plan
- `min_fit`: the lowest fit level worth finding buyers at, e.g. good
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8; a yes-or-no answer counts as yes at or above it and as no at or below 1 minus it
- `buyer_titles`: the people to find at each company that fits, e.g. VP Marketing, Head of Growth

## Steps

1. **List candidates** with [hunter/search-companies](../companies/hunter/tools/search-companies.md). Search for `target_segment` and keep up to `max_companies` companies, with each one's name and domain.
2. **Read each homepage** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Scrape each domain's homepage as markdown. Keep the page text, and note the domains that fail to load or redirect elsewhere.
3. **Qualify** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each homepage's text as the state, with a score `fit` whose levels describe the match with `ideal_customer`: no fit (matches none of it), weak (matches some), good (matches most) and ideal (matches all); a choice `business_model` of b2b_software, b2b_services, b2c, marketplace, agency and other; a choice `sales_motion` of self_serve (sign-up and prices on the site), sales_led (demo or contact sales only) and hybrid; and a noul `active_business` (a live product, not a parked, acquired or shut-down site). Keep every answer with its confidence or probability.
4. **Check the unsure ones with the user**. Show the user every company whose fit confidence is below `min_confidence` or whose `active_business` is unsure, with its homepage's first lines, and keep what the user decides. Keep the active businesses with a fit of `min_fit` or better.
5. **Find the buyers** with [apollo/search-people](../companies/apollo/tools/search-people.md). Search each company that fits for `buyer_titles`. Keep each person's Apollo ID, first name, title and company.

## Notes

Qualifying before enriching saves credits: an email lookup costs one whether or not the company fits, while Jev is billed only for the tokens it reads. A data provider's industry code can miss what a company actually sells, which is why the fit is read from what the company says about itself.

Read the fit by its most likely level, not its expected score, and rank companies within a level by the summed probability of good and ideal. Apollo's search spends no credits and returns no emails, so enrich only the buyers you keep.
