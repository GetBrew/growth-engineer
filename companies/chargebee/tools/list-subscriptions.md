---
name: List subscriptions
summary: Returns the subscriptions that match every filter you pass, such as status, customer or plan price, with plan and billing details.
capability: track-revenue
docs: https://apidocs.chargebee.com/docs/api/subscriptions/list-subscriptions
api: GET /subscriptions
updated: 2026-09-27
---

Filter with `status[is]` (`future`, `in_trial`, `active`, `non_renewing`,
`paused` or `cancelled`), `customer_id[is]` or `item_price_id[is]`. Pages hold
10 by default and up to 100 with `limit`; pass `next_offset` back as `offset`
for the next page.
