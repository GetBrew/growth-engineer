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
- `stripe_emails_on`: whether Stripe already emails customers about failed payments, e.g. no; if yes, this workflow only escalates
- `escalate_amount`: the amount due that deserves a personal call, with its currency, e.g. 1,000 USD (Stripe's 100000 in cents)
- `cs_channel`: the Slack channel for escalations, e.g. #customer-success

## Steps

1. **Find past-due subscriptions** with [stripe/list-subscriptions](../companies/stripe/tools/list-subscriptions.md). List subscriptions with status `past_due`. Keep each subscription ID and customer ID.
2. **Get the unpaid invoices** with [stripe/list-invoices](../companies/stripe/tools/list-invoices.md). For each subscription, list its `open` invoices. Keep, per customer, `customer_name`, `customer_email`, and each invoice's `amount_due` and `currency` (in the currency's smallest unit), `next_payment_attempt` and `hosted_invoice_url`.
3. **Write the nudges**. Skip this step and the next when `stripe_emails_on` is yes, so no one gets two emails. Otherwise draft one short, friendly email per customer, with a subject and a plain-text body: the payment did not go through, each `hosted_invoice_url` to pay or update the card, and the next retry date, or that no retries are left when `next_payment_attempt` is empty. Show the drafts to the user.
4. **Send** with [resend/send-email](../companies/resend/tools/send-email.md). After the user approves, send each email from `sender` to its `customer_email`, one recipient per email. Keep each email's ID.
5. **Escalate the big ones** with [slack/post-message](../companies/slack/tools/post-message.md). Post one message per customer who owes `escalate_amount` or more to `cs_channel`, with `customer_name`, the amount and the next retry date.

## Done when

- Every customer with a past-due subscription got an email, or has a note saying why not.
- `cs_channel` has one post per large account, and the user has the total amount due by currency.
