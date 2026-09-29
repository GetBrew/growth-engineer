---
title: Email new GitHub stargazers who fit your ideal customer
summary: Finds who recently starred your repo, keeps the people at companies you sell to, and queues a no-pitch thank-you email in lemlist.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of the new stargazers, with their company and whether they were queued, or why not.
- An approved no-pitch email for each good fit, queued in your lemlist campaign.

## Inputs

- `repo`: the repository to watch, as owner/name, e.g. acme/acme-sdk
- `lookback_days`: how recent a star counts, e.g. 14
- `ideal_customer`: the companies you sell to, e.g. B2B software, 50 to 1,000 employees
- `resources`: one or two links worth sharing with a new user, e.g. the quickstart and an example app
- `max_enrichments`: the most people to enrich in one run, since each match costs a credit, e.g. 50
- `campaign`: the lemlist campaign that sends the emails, by name, e.g. Stargazer thank-you
- `email_variable`: the custom variable the campaign's email prints as its whole body, set up once in lemlist, e.g. drafted_email

## Steps

1. **List new stargazers** with [github/list-stargazers](../companies/github/tools/list-stargazers.md). List the users who starred `repo`, with star times; the newest stars are on the last page, so follow the `Link` header there and read backwards. Keep the logins that starred within `lookback_days`.
2. **Identify them** with [people-data-labs/enrich-person](../companies/people-data-labs/tools/enrich-person.md). Match up to `max_enrichments` logins on the profile URL `https://github.com/<login>`, requiring a work email. Keep name, title, work email, `job_company_website`, `job_company_size` and `job_company_industry`; skip people with no match.
3. **Qualify the company** with [people-data-labs/enrich-company](../companies/people-data-labs/tools/enrich-company.md). Look up the website only for people whose company size or industry is missing. Keep the people whose company fits `ideal_customer`.
4. **Write emails**. Draft a three-sentence plain-text email per person: thank them for the star, share one link from `resources` that fits their role, ask one question. No pitch. Show the drafts to the user.
5. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each person to `campaign` with their approved email in `email_variable`.
