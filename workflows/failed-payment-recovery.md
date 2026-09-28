---
title: Recover failed payments before the subscription cancels
summary: Catch past-due subscriptions early, send a friendly link to fix the card, and hand the biggest accounts to a person.
author: thedogwiththedataonit
tags:
  - motion:retention
  - channel:email
  - channel:chat
updated: 2026-09-27
---

## Inputs

- `sender`: the address to send from, on a domain verified in Resend, e.g. billing@acme.example
- `escalate_amount`: the amount due that deserves a personal call, e.g. 1000
- `cs_channel`: the Slack channel for escalations, e.g. #customer-success

## Steps

1. **Find past-due subscriptions** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). List subscriptions with status `past_due`. Keep each subscription ID and customer ID.
2. **Get the unpaid invoice** with [stripe/list-invoices](../companies/stripe/tools/list-invoices.md). For each subscription, list its `open` invoices. Keep the amount due, currency, `customer_email`, `next_payment_attempt` and `hosted_invoice_url`.
3. **Write the nudge** with [anthropic/create-message](../companies/anthropic/tools/create-message.md). Draft one short, friendly plain-text email per customer: the payment did not go through, the `hosted_invoice_url` to pay or update the card, and when the next retry happens. Show the drafts to the user.
4. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each email from `sender` to its `customer_email`, one recipient per email. Keep each email's ID.
5. **Escalate the big ones** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per invoice with an amount due of `escalate_amount` or more to `cs_channel`, with the customer, the amount and the retry date. Ask the user before posting the first one.

## Done when

- Every past-due subscription has a sent email, or a note saying why not.
- `cs_channel` has one post per large invoice, and the user has the total amount due.
