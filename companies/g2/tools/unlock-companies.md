---
name: Unlock companies showing intent
summary: Spends G2 Activate credits to reveal up to 25 masked companies that are showing intent for your product, and returns them.
notes: "Every new unlock spends credits: confirm with the user first. Get the `sig` values from `GET /api/v2/products/{product_id}/g2_activate/locked_companies`; it always returns 200, so check `meta.skipped[]` for sigs that couldn't be unlocked."
capability: track-intent
docs: https://data.g2.com/api/v2/docs/index.html
api: POST /api/v2/products/{product_id}/g2_activate/unlocked_companies
updated: 2026-09-27
---
