---
title: Verify an email list before you send to it
summary: Cleans an email list, verifies every address with Bouncer, and splits it into send, review and remove lists with a reason for each.
author: j-z-usebouncer
motion: outbound
tags:
  - channel:email
added: 2026-10-06
updated: 2026-10-09
---

## Outcome

- A send list of the deliverable addresses, with the columns the list came with, ready to import into your sending tool.
- A review list of the risky and unknown addresses, each with Bouncer's reason and flags.
- A remove list of the undeliverable addresses and the malformed rows, each with the reason it was dropped.
- A summary of how many addresses landed in each list and the credits the run used.

## Inputs

- `email_list`: the list to verify, as a CSV or pasted rows, and the column that holds the email address, e.g. q4-webinar-leads.csv, column Email
- `max_credits`: the most credits this run may spend, e.g. 5000
- `keep_catch_all`: whether risky addresses on catch-all domains go to the send list instead of review, e.g. no

## Steps

1. **Clean the list**. Read `email_list`, trim spaces, lowercase each address and drop exact duplicates, keeping the first row of each. Move rows with no address or no `@` and domain straight to the remove list with the reason malformed. Tell the user how many unique addresses remain and that verifying them costs up to that many credits; stop if it is more than `max_credits`. Keep the unique addresses and each one's original row.
2. **Submit the batch** with [bouncer/create-verification-batch](../companies/bouncer/tools/create-verification-batch.md). After the user approves the cost, send the unique addresses as one batch, or as batches of 10,000 when there are more than that. Keep each `batchId`.
3. **Wait for it to finish** with [bouncer/check-batch-status](../companies/bouncer/tools/check-batch-status.md). Check each batch about every 10 seconds, with `with-stats=true`, until its status is completed. Keep each batch's stats and `credits`.
4. **Download the results** with [bouncer/get-batch-results](../companies/bouncer/tools/get-batch-results.md). Download every batch with `download` set to all. Keep each address's `status`, `reason`, `score`, `toxicity`, any `retryAfter`, and the `domain.acceptAll`, `domain.disposable`, `account.role` and `account.fullMailbox` flags (each yes, no or unknown).
5. **Retry the greylisted ones** with [bouncer/verify-email](../companies/bouncer/tools/verify-email.md). For each unknown address that came back with a `retryAfter`, wait until that time and verify it once more; skip this step when none did. Keep the new result in place of the old one.
6. **Sort the list**. Put deliverable addresses on the send list. Put risky and unknown addresses on the review list, except that risky addresses with `domain.acceptAll` yes, and neither `account.fullMailbox` nor `domain.disposable` yes, go on the send list when `keep_catch_all` is yes. Put undeliverable addresses on the remove list. Join each address back to its original row and add columns for status, reason, score and the four flags.
7. **Hand over the lists**. Give the user the send, review and remove lists as CSV files, and a table of how many addresses are in each, the most common reasons on the review and remove lists, and the credits all batches used.

## Notes

Bouncer charges 1 credit per address and nothing for duplicates within a batch or for unknown results, so the cost in step 1 is an upper bound.

Bouncer marks an address risky when its domain accepts all mail (catch-all), its mailbox is full or it is disposable. `keep_catch_all` lets catch-all addresses through while full and disposable ones wait for review. Role accounts such as info@ stay on the send list when deliverable; filter on the `account.role` column if your sending tool or policy excludes them.

The lists are only as clean as the day they were checked. Verify again before a send to a list that is more than a few months old.
