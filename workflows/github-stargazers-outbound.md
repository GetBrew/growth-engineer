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
- `campaign_id`: the lemlist campaign that sends the emails, e.g. cam_123; its email reads each lead's drafted text from a custom variable

## Steps

1. **List new stargazers** with [github/list-stargazers](../companies/github/tools/list-stargazers.md). List the users who starred `repo`, with star times. Keep the logins that starred within `lookback_days`.
2. **Identify them** with [people-data-labs/enrich-person](../companies/people-data-labs/tools/enrich-person.md). Match each login on the profile URL `https://github.com/<login>`. Keep name, title, employer, employer website and work email; skip people with no match.
3. **Qualify the company** with [people-data-labs/enrich-company](../companies/people-data-labs/tools/enrich-company.md). For each employer website, keep size and industry. Keep only the people whose company fits `ideal_customer`.
4. **Write emails** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft a three-sentence plain-text email per person: thank them for the star, offer one useful resource for someone in their role, ask one question. No pitch. Show the drafts to the user.
5. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each person to `campaign_id` with their approved email as a custom variable.

## Done when

- Every new stargazer is queued, or has a note saying they did not match or did not fit.
- The user has a table of who starred, their company and whether they were queued.
