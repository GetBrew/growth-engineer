---
name: Unlock companies showing intent
summary: Spends G2 Activate credits to reveal up to 25 masked companies that are showing intent for your product, and returns them.
capability: track-intent
docs: https://data.g2.com/api/v2/docs/index.html
api: POST /api/v2/products/{product_id}/g2_activate/unlocked_companies
updated: 2026-09-27
---

List the masked companies first with
`GET /api/v2/products/{product_id}/g2_activate/locked_companies`, then pass
their `sig` values in `sigs` (1 to 25). The call always returns 200: a sig
that couldn't be unlocked is listed in `meta.skipped[]`, and replaying a sig
that is already unlocked costs nothing. Read an unlocked company with its
resolved contacts from
`GET /api/v2/products/{product_id}/g2_activate/unlocked_companies/{id}`.
Needs the `g2_activate.write` scope. Every new unlock spends credits: confirm
with the user first.
