---
name: Get email metrics
summary: Returns the account's delivery and engagement counts and rates, such as sent, delivered, open, click, bounce and unsubscribe, for a date range as totals or by period, domain, email or broadcast.
notes: Rates are percentages. Opens and clicks need tracking on the sending domain. Data older than the plan keeps is dropped, so check `start_date` in the response. The `email` and `broadcast` dimensions can't be combined. Edge periods can be partial; results cache 15 minutes.
capability: track-email-engagement
docs: https://resend.com/docs/api-reference/emails/get-metrics
mcp: get-email-metrics
cli: resend emails metrics
api: GET /emails/metrics
updated: 2026-09-30
---
