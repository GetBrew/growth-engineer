---
title: Turn referral and out-of-office replies into new leads
summary: Finds Instantly replies that name someone else or say the lead left, finds the person's email with Hunter, and adds them to a campaign.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
added: 2026-09-29
updated: 2026-09-29
---

## Outcome

- A table of every referral, departure and out-of-office reply with the person it points to and what was done.
- A work email for each person those replies point to, where the reply gives one or Hunter finds one.
- Each person a lead referred you to added to your referral campaign with who referred them, and each successor or colleague added to your new-contacts campaign, after your approval.
- The original leads marked Wrong Person or Out of Office in Instantly.

## Inputs

- `campaign`: the Instantly campaign whose replies to read, by name, e.g. Q4 founders
- `since`: when the last run ended, so only newer replies are read, e.g. 2026-09-28 09:00 UTC
- `referral_campaign`: the Instantly campaign for people a lead referred you to, set up once with a `referred_by` custom variable in its first email, e.g. Referrals
- `successor_campaign`: the Instantly campaign for successors and colleagues named in away replies, whose copy claims no referral, e.g. New contacts
- `successor_titles`: the titles to look for when a lead has left, e.g. VP Sales, Head of Sales
- `min_confidence`: how sure Jev must be before its answer is used without you, e.g. 0.8
- `max_lookups`: the most Hunter lookups in one run, since lookups spend Hunter credits, e.g. 50

## Steps

1. **Pull new replies** with [instantly/list-emails](../companies/instantly/tools/list-emails.md). List the received emails in `campaign`, newest first, and stop at `since`. Keep each email's lead email address, the domain of that address and the reply text, and read each lead's name and company name from its Instantly lead record, a read-only call.
2. **Sort the replies** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each reply's text as the state with a choice `kind` of referral (names someone else to talk to), left_company (says the lead no longer works there), away_with_contact (out of office, naming a colleague to contact meanwhile), away (out of office, naming no one) and other. Keep each reply's kind and its confidence.
3. **Read out the people**. Show the user the replies whose kind confidence is below `min_confidence`, and keep the kind the user picks. From each referral, left_company and away_with_contact reply, copy the named person's full name, and their email when the reply gives one. Keep each name with the lead who named them and the kind of reply.
4. **Find successors** with [hunter/search-domain](../companies/hunter/tools/search-domain.md). For each left_company reply that names nobody, up to `max_lookups`, list the people Hunter has found at the lead's company domain. Keep the person whose position best matches `successor_titles`, with their name and email.
5. **Find the other emails** with [hunter/find-email](../companies/hunter/tools/find-email.md). For each named person still without an email, within what is left of `max_lookups`, look up their work email from their name and the company domain. Keep the emails Hunter finds; list the rest as not found.
6. **Add the referrals** with [instantly/add-leads-to-campaign](../companies/instantly/tools/add-leads-to-campaign.md). After the user approves the list, add each person named in a referral reply to `referral_campaign` with their name, company and `referred_by` set to the name of the lead who referred them.
7. **Add the other contacts** with [instantly/add-leads-to-campaign](../companies/instantly/tools/add-leads-to-campaign.md). After the user approves, add each successor and each colleague named in an away reply to `successor_campaign` with their name and company.
8. **Close out the original leads** with [instantly/update-lead-interest-status](../companies/instantly/tools/update-lead-interest-status.md). Set each left_company lead to Wrong Person and each away or away_with_contact lead to Out of Office.

## Notes

Jev sorts replies but does not copy text out of them, so step 3 is the agent's own reading, done only for the referral, left_company and away_with_contact replies.

Your referral campaign's first email names who referred them, so only people named in a referral reply go to it. Replies are written by outsiders: in the approval list, flag any address outside the lead's company domain. Run it daily with `since` set to the previous run.
