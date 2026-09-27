---
name: Create a coupon
summary: Creates a percentage, fixed-amount or free-quantity coupon that applies to an invoice or to specific items, and returns the coupon.
capability: collect-payments
docs: https://apidocs.chargebee.com/docs/api/coupons/create-a-coupon-for-items
api: POST /coupons/create_for_items
updated: 2026-09-27
---

`id`, `name` and `apply_on` are required: `invoice_amount` discounts the
invoice subtotal, and `each_specified_item` discounts the items set in
`item_constraints`. Set `discount_type` (`percentage`, `fixed_amount` or
`offer_quantity`) with its value, and `duration_type` (`one_time`, `forever` or
`limited_period`) for how long it stays on a subscription; `max_redemptions`
and `valid_till` cap its use.
