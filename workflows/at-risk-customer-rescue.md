---
title: Flag customers whose usage dropped before they renew
summary: Finds accounts whose usage fell in Mixpanel and renew soon in Stripe, alerts customer success in Slack, and drafts a check-in email.
author: thedogwiththedataonit
motion: retention
tags:
  - channel:chat
  - channel:email
updated: 2026-09-29
---

## Outcome

- A Slack post in `cs_channel` for each at-risk account renewing within `renewal_window`, with both usage counts and the renewal date.
- A drafted check-in email for each of those accounts, signed by `signer`.
- The accounts ordered by renewal date, with the billing emails that matched no Stripe customer.

## Inputs

- `mixpanel_project`: the Mixpanel project id, e.g. 2195193
- `usage_event`: the Mixpanel event that means real usage, e.g. report_created
- `account_email_property`: the Mixpanel user property that holds each account's billing email, e.g. billing_email
- `drop_threshold`: the usage drop that counts, e.g. 40%
- `renewal_window`: how soon an annual renewal is, e.g. 90 days
- `signer`: who signs the check-in emails, e.g. Dana, Customer Success
- `cs_channel`: the Slack channel to escalate in, e.g. #customer-success

## Steps

1. **Detect drops** with [mixpanel/run-query](../companies/mixpanel/tools/run-query.md). In `mixpanel_project`, count `usage_event` broken down by `account_email_property` for the last 30 days and the 30 days before; a billing email missing from the last 30 days counts as 0. Keep each billing email whose count fell by more than `drop_threshold`, with both counts.
2. **Find their customers** with [stripe/list-customers](../companies/stripe/tools/list-customers.md). Look up each billing email, as stored and lowercased. Keep each customer's ID and name; note the emails with no customer.
3. **Check renewals** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). For each customer, list active subscriptions that are not set to cancel at period end. Keep the yearly ones whose subscription item's `current_period_end` falls within `renewal_window`, with that date.
4. **Escalate** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per at-risk account to `cs_channel` with the customer's name, both usage counts and the renewal date.
5. **Write the check-ins**. Draft a short plain-text email per account, signed by `signer`, that names the drop without blame and offers a call. Show the drafts to the user.
