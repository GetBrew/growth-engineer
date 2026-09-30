---
title: Resolve a personal email into its likely company
summary: Looks up the person and company behind a personal email, corroborates the match, enriches the company, and scores confidence.
author: shipgtm
motion: inbound
updated: 2026-09-29
---

## Outcome

- The likely person and company behind the email, or a clear "unresolved" when no source confirms one.
- An identity confidence and a fit score for the match against your target segment.
- Anything low-confidence or conflicting flagged for manual review instead of guessed.

## Inputs

- `personal_email`: the personal email address to resolve, e.g. jane.doe@gmail.com
- `target_segment`: the kind of company that counts as a fit, e.g. Series A-B B2B SaaS in the US

## Steps

1. **Look up the person and company** with [hunter/enrich-person-and-company](../companies/hunter/tools/enrich-person-and-company.md). Look up `personal_email`. Keep the person's name, LinkedIn, location and employer, and the employer's domain.
2. **Corroborate the match** with [people-data-labs/enrich-person](../companies/people-data-labs/tools/enrich-person.md). Enrich the same email, requiring an employer match. Keep whether its employer and location agree with step 1, as the identity confidence.
3. **Enrich the company** with [apollo/enrich-company](../companies/apollo/tools/enrich-company.md). Look up the employer domain from step 1. Keep industry, employee count and funding for a fit check.
4. **Score and flag**. Give the match an identity confidence from whether steps 1 and 2 agree on employer and location, and a fit score from whether the enriched company matches `target_segment`. Flag anything below high confidence on either for manual review instead of guessing.

## Notes

This looks up public business identity only; discard anything below your confidence bar rather than storing it, and never use a result Hunter or PDL returned as unresolved.

Adapted from ShipGTM's [personal email enrichment guide](https://shipgtm.substack.com/p/unlocking-company-data-from-personal).
