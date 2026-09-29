---
title: Turn referral and out-of-office replies into new leads
summary: Finds Instantly replies that name someone else or say the person left, finds the right person's email, and adds them to a referral campaign.
author: thedogwiththedataonit
motion: outbound
tags:
  - channel:email
updated: 2026-09-29
---

## Outcome

- A table of every referral, departure and out-of-office reply with the person it points to and what was done.
- A work email for each person those replies point to, taken from the reply or found with Hunter.
- Each new person added to your referral campaign with who sent you to them, after your approval.
- The original leads marked Wrong Person or Out of Office in Instantly.

## Inputs

- `campaign`: the Instantly campaign whose replies to read, by name, e.g. Q4 founders
- `since`: when the last run ended, so only newer replies are read, e.g. 2026-09-28 09:00 UTC
- `referral_campaign`: the Instantly campaign that emails the people replies point to, set up once with a `referred_by` custom variable in its first email, e.g. Referrals
- `min_confidence`: the confidence below which you sort a reply yourself, e.g. 0.8
- `max_lookups`: the most emails to look up in one run, since each one found costs a Hunter credit, e.g. 50

## Steps

1. **Pull new replies** with [instantly/list-emails](../companies/instantly/tools/list-emails.md). List the received emails in `campaign`, newest first, and stop at `since`. Keep each email's lead email address, the lead's name and company domain, and the reply text.
2. **Sort the replies** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each reply's text as the state with a choice `kind` of referral (names someone else to talk to), left_company (says the lead no longer works there), away_with_contact (out of office and names a colleague to contact meanwhile), away (out of office with no one named) and other, and a noul `gives_email` (the reply includes the other person's email address). Keep the kind, its confidence and `gives_email`.
3. **Read out the people**. Show the user the replies under `min_confidence` and keep the kind the user picks. From each referral, left_company and away_with_contact reply, copy the named person's full name, and their email when `gives_email` is likely. Keep each name with the lead who named them.
4. **Find a successor** with [apollo/search-people](../companies/apollo/tools/search-people.md). For each left_company reply that names nobody, search the company's domain for people with the lead's former title. Keep the best match's name and title.
5. **Find their emails** with [hunter/find-email](../companies/hunter/tools/find-email.md). For each person still without an email, up to `max_lookups`, look up their work email from their name and the company domain. Keep the emails Hunter marks as valid; list the rest as not found.
6. **Add them to the campaign** with [instantly/add-leads-to-campaign](../companies/instantly/tools/add-leads-to-campaign.md). After the user approves the list, add each person to `referral_campaign` with their name, company and `referred_by` set to the name of the lead who pointed to them.
7. **Close out the original leads** with [instantly/update-lead-interest-status](../companies/instantly/tools/update-lead-interest-status.md). Set each left_company lead to Wrong Person and each away or away_with_contact lead to Out of Office.

## Notes

Jev sorts the reply; it does not copy text out of it. That is why step 3 is the agent's own reading: names and dates are extraction, and only the replies Jev placed in the three useful kinds need it.

A referral email opens with the name of the person who sent you, so check each `referred_by` value before step 6. Run it daily with `since` set to the previous run.
