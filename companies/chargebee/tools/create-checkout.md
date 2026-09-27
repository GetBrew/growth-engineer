---
name: Create a checkout for a new subscription
summary: Creates a Chargebee-hosted checkout page for the plan and add-on prices you pass and returns it with the URL to send the customer.
capability: collect-payments
docs: https://apidocs.chargebee.com/docs/api/hosted_pages/create-checkout-for-a-new-subscription
api: POST /hosted_pages/checkout_new_for_items
updated: 2026-09-27
---

Pass the prices as `subscription_items[item_price_id][0]`, `[1]` and so on,
with quantities; the first must be a plan. `customer[id]`, `coupon_ids` and
`redirect_url` are optional. Completing checkout at the returned `url` creates
the subscription. Don't rely on the redirect for critical post-checkout work:
retrieve the hosted page to get the subscription and invoice.
