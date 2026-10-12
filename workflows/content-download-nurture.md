---
title: Follow up on downloads with the section they need
summary: Finds recent downloads of your asset in HubSpot, queues each person the section that fits their role with Brew, and logs it in Notion.
author: thedogwiththedataonit
motion: inbound
tags:
  - channel:email
featured: true
added: 2026-09-22
updated: 2026-10-11
---

## Outcome

- A follow-up email, queued or declined by you, for every opted-in contact who recently downloaded the asset, each pointing to the section that fits them.
- One row per accepted send in your Notion log, with the contact, section, date, send ID and observed status.

## Inputs

- `asset_url`: where the downloaded asset lives, e.g. https://acme.example/benchmark
- `download_form`: the name HubSpot records for the form that gates the asset, e.g. 2026 outbound benchmark download
- `follow_up_window`: how far back to look, e.g. 3 days
- `nurture_log`: the Notion database that logs each send, set up once with Contact, Section, Date, Send ID and Status properties

## Steps

1. **Read the asset** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch `asset_url` as markdown. Keep its section headings and one line on each.
2. **Pull downloads** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts whose `recent_conversion_event_name` contains `download_form` and whose `recent_conversion_date` falls within `follow_up_window`, requiring a recorded marketing opt-in and leaving out anyone with `hs_email_optout` set. Absence of an opt-out alone is not consent. Keep name, email, job title, company and industry.
3. **Write follow-ups** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email per contact that picks the section from step 1 most relevant to their role and industry. Show the drafts to the user. Keep each approved email's `emailId`, `emailVersionId` and subject.
4. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Match each consent-qualified address to an existing subscribed Brew contact. If it is missing, stop for the user to prepare their consented contact list. Send each approved email to that contact, with the idempotency key `<emailVersionId>:<email>`.
5. **Read send status** with [brew/get-send](../companies/brew/tools/get-send.md). Read each returned sendId. Poll until terminal or the execution window ends; keep the observed status and delivery accounting. A queued or pending send has not been delivered.
6. **Log the send** with [notion/create-page](../companies/notion/tools/create-page.md). Add one row per accepted send to `nurture_log` with its contact, section, date, sendId and observed status. Record delivery only when Brew reports it; keep pending and failed results explicit.
