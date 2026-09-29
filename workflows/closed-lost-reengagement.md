---
title: Reopen closed-lost deals when something has changed
summary: Finds Salesforce deals lost months ago, checks who is still there and what changed, and queues an email to them in lemlist.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- An approved email queued in your lemlist campaign for each contact still at a lost account, naming what changed.
- A Salesforce task on each opportunity with a queued contact.
- A table of every contact on a lost deal in the window, queued or marked left, unknown or skipped, and the opportunities with no contacts.

## Inputs

- `lost_between`: how long ago the deal was lost, e.g. 90 to 180 days
- `lost_stage`: the Salesforce opportunity stage for lost deals, e.g. Closed Lost
- `product_changes`: what you shipped since, e.g. SSO and a HubSpot integration
- `campaign`: the lemlist campaign that sends the emails, by name, e.g. Closed-lost check-in
- `email_variable`: the custom variable the campaign's email prints as its whole body, set up once in lemlist, e.g. drafted_email

## Steps

1. **Find lost deals** with [salesforce/query-records](../companies/salesforce/tools/query-records.md). Query opportunities in `lost_stage` whose `CloseDate` falls within `lost_between`, with their `Id`, name, close date, account name and website, and each contact role's `ContactId`, name, title and email. Keep one row per contact, once per email; note the opportunities with no contact roles.
2. **Check who is still there** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). Match each contact on their email. Keep the ones whose current employer's domain is the account website's domain, with their current title; mark the rest as left or unknown.
3. **Check what changed** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). For each account website, keep any funding round dated after the close date.
4. **Write emails**. Draft a three-sentence plain-text email per contact still there that names one change: a funding round from step 3, or else the most relevant item in `product_changes`. Show the drafts to the user.
5. **Queue the emails** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each contact to `campaign` with their approved email in `email_variable`.
6. **Log it** with [salesforce/create-record](../companies/salesforce/tools/create-record.md). Create a Task per queued contact, with `WhatId` set to the opportunity `Id` and `WhoId` to the `ContactId`, saying they were contacted again and why.
