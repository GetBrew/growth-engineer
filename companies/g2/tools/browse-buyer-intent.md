---
name: Browse buyer intent
summary: Returns the companies researching your products on G2 and what they looked at, such as profiles, pricing or comparisons, across one or more of your products.
capability: track-intent
docs: https://data.g2.com/api/v2/docs/index.html
mcp: browse_buyer_intent
api: GET /api/v2/buyer_intent
updated: 2026-09-27
---

Scope the query with `subject_product_ids`, or leave it out to use your
assigned products. Group rows with `dimensions` such as `company_name`,
`company_domain`, `signal_type` or `day`, count with `measures` such as
`total_activity` and `visitor_count`, and filter with `dimension_filters`,
for example `dimension_filters[company_name_cont]=Acme`. A page holds up to
250 rows. Needs the `buyer_intent.read` scope and a G2 Buyer Intent license.
