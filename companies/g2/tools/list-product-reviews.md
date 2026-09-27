---
name: List product reviews
summary: Returns the G2 reviews of a product, filterable by reviewer company size, industry, region, role, star rating and date.
capability: read-reviews
docs: https://data.g2.com/api/v2/docs/index.html
mcp: list_standard_product_reviews
api: GET /api/v2/products/{product_id}/reviews
updated: 2026-09-27
---

Pass the product's ID or slug. Filter with `filter[company_segment][]`
(`179` Small-Business, `180` Mid-Market, `181` Enterprise),
`filter[nps_score][]` for star ratings from 1 to 5, `filter[industry][]`,
`filter[region][]`, `filter[role][]` and `filter[updated_at_gt]`. A page
holds up to 250 reviews. Needs the `products.reviews.read` scope. Reviews
with firmographics and feature ratings come from
`list_market_intelligence_product_reviews`
(`GET /api/v2/products/{product_id}/market_intelligence/reviews`), which needs
an Enterprise package.
