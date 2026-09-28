---
title: Turn new GitHub stargazers into qualified conversations
summary: Find out who just starred your repository, keep the ones at companies you sell to, and start a relevant, low-pressure conversation.
author: thedogwiththedataonit
tags:
  - motion:plg
  - motion:outbound
  - channel:email
updated: 2026-09-27
---

## Inputs

- `repo`: the repository to watch, as owner/name, e.g. acme/acme-sdk
- `lookback_days`: how recent a star counts, e.g. 14
- `ideal_customer`: the companies you sell to, e.g. B2B software, 50 to 1,000 employees
- `resources`: one or two links worth sharing with a new user, e.g. the quickstart and an example app
- `max_enrichments`: the most people to enrich in one run, since each match costs a credit, e.g. 50
- `campaign_id`: the lemlist campaign that sends the emails, e.g. cam_123
- `email_variable`: the custom variable that campaign's email prints as its body, e.g. drafted_email

## Steps

1. **List new stargazers** with [github/list-stargazers](../companies/github/tools/list-stargazers.md). List the users who starred `repo`, with star times; the newest stars are on the last page, so follow the `Link` header there and read backwards. Keep the logins that starred within `lookback_days`.
2. **Identify them** with [people-data-labs/enrich-person](../companies/people-data-labs/tools/enrich-person.md). Match up to `max_enrichments` logins on the profile URL `https://github.com/<login>`, requiring a work email. Keep name, title, work email, `job_company_website`, `job_company_size` and `job_company_industry`; skip people with no match.
3. **Qualify the company** with [people-data-labs/enrich-company](../companies/people-data-labs/tools/enrich-company.md). Look up the website only for people whose company size or industry is missing. Keep the people whose company fits `ideal_customer`.
4. **Write emails**. Draft a three-sentence plain-text email per person: thank them for the star, share one link from `resources` that fits their role, ask one question. No pitch. Show the drafts to the user.
5. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each person to `campaign_id` with their approved email in `email_variable`.

## Done when

- Every new stargazer is queued, or has a note saying they did not match or did not fit.
- The user has a table of who starred, their company and whether they were queued.
