---
name: Create a checkout for a new subscription
summary: Creates a Chargebee-hosted checkout page for the plan and add-on prices you pass and returns it with the URL to send the customer.
notes: "The first `subscription_items` price must be a plan. The subscription exists only once the customer completes checkout at the returned `url`: retrieve the hosted page for the subscription and invoice rather than relying on the redirect."
capability: collect-payments
docs: https://apidocs.chargebee.com/docs/api/hosted_pages/create-checkout-for-a-new-subscription
api: POST /hosted_pages/checkout_new_for_items
updated: 2026-09-27
---
