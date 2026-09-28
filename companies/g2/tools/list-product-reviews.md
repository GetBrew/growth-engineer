---
name: List product reviews
summary: Returns the G2 reviews of a product, filterable by reviewer company size, industry, region, role, star rating and date.
notes: Needs the `products.reviews.read` scope; a page holds up to 250 reviews. Reviews with firmographics and feature ratings come from `GET /api/v2/products/{product_id}/market_intelligence/reviews`, which needs an Enterprise package.
capability: read-reviews
docs: https://data.g2.com/api/v2/docs/index.html
mcp: list_standard_product_reviews
api: GET /api/v2/products/{product_id}/reviews
updated: 2026-09-27
---
