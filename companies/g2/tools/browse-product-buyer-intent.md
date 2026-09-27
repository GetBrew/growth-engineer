---
name: Browse buyer intent for a product
summary: Returns the companies researching one of your products or its competitors on G2, ranked by intent score, with their activity and signal types.
capability: track-intent
docs: https://data.g2.com/api/v2/docs/index.html
mcp: browse_product_buyer_intent
api: GET /api/v2/products/{subject_product_id}/buyer_intent
updated: 2026-09-27
---

Pass your product's identifier as `subject_product_id`. Rows are sorted by
`-company_intent_score` unless you set `sort`. Leave `day` out of
`dimensions` for one row per company, or add it for a daily series. Results
include activity on competitors in your categories: when `left_product_id`
differs from `subject_product_id`, the company was looking at the competitor
named in `left_product_name`. Needs the `buyer_intent.read` scope.
