---
name: Stripe
domain: stripe.com
category: payments
tagline: Accept payments and run subscriptions; revenue events as triggers.
docs: https://docs.stripe.com
github: https://github.com/stripe
logo: stripe.jpg
mcp:
  url: https://mcp.stripe.com
  auth: oauth
  docs: https://docs.stripe.com/mcp
cli:
  install: npm install -g @stripe/cli
  binary: stripe
  auth: oauth
  docs: https://docs.stripe.com/stripe-cli
api:
  url: https://api.stripe.com
  auth: api_key
  env: STRIPE_API_KEY
  keyUrl: https://dashboard.stripe.com/apikeys
  docs: https://docs.stripe.com/api
updated: 2026-09-26
---

Stripe is a global financial infrastructure platform that enables businesses of all sizes to accept payments, manage billing, and build custom revenue models.

Stripe's MCP server reaches the API through generic tools rather than one tool per method: `stripe_api_read` runs any supported `GET` method and `stripe_api_write` any supported `POST`, `PATCH`, `PUT` or `DELETE` method, while `stripe_api_search` and `stripe_api_details` find a method and its parameters. The CLI signs in with `stripe login` in the browser, or reads a key from `STRIPE_API_KEY`.
