---
name: List subscriptions
summary: Returns subscriptions filtered by status, customer or price; with no status it returns every subscription that is not canceled.
capability: track-revenue
docs: https://docs.stripe.com/api/subscriptions/list
mcp: stripe_api_read
cli: stripe subscriptions list
api: GET /v1/subscriptions
aliases:
  - stripe/track-revenue
updated: 2026-09-27
---
