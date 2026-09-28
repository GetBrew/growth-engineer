---
title: Reopen closed-lost deals when something has changed
summary: Revisit deals lost months ago, check what changed at each account, and reach the people still there with a reason to talk again.
author: thedogwiththedataonit
tags:
  - motion:outbound
  - channel:email
updated: 2026-09-27
---

## Inputs

- `lost_between`: how long ago the deal was lost, e.g. 90 to 180 days
- `lost_stage`: the Salesforce opportunity stage for lost deals, e.g. Closed Lost
- `product_changes`: what you shipped since, e.g. SSO and a HubSpot integration
- `campaign_id`: the lemlist campaign that sends the emails, e.g. cam_123; its email reads each lead's drafted text from a custom variable

## Steps

1. **Find lost deals** with [salesforce/query-records](../companies/salesforce/tools/query-records.md). Query opportunities in `lost_stage` whose `CloseDate` falls within `lost_between`, with their name, amount, close date, account name and website, and each contact role's contact name, title and email. Keep one row per contact.
2. **Check who is still there** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each contact on their email. Keep the ones still at the same company, with their current title; note the ones who left.
3. **Check what changed** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each account website, keep the employee count and any funding round dated after the close date.
4. **Write emails** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft a three-sentence plain-text email per contact that names one change: a new round or growth at their company from step 3, or else the most relevant item in `product_changes`. Show the drafts to the user.
5. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each contact to `campaign_id` with their approved email as a custom variable.
6. **Log it** with [salesforce/create-record](../companies/salesforce/tools/create-record.md). Create a Task on each opportunity, with `WhatId` set to its ID, saying who was contacted and why.

## Done when

- Every contact on a lost deal in the window is queued, or has a note saying they left or were skipped.
- Each reopened opportunity has a Task, and the user has a summary table.
