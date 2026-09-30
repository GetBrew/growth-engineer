---
title: Resolve a personal email into its likely company
summary: Researches the person behind a personal email with Exa, corroborates the match, and logs the result in HubSpot with a confidence score.
author: shipgtm
motion: inbound
updated: 2026-09-29
---

## Outcome

- The likely person and company behind the email, each with a citation, or a clear "unresolved" when the sources disagree or nothing turns up.
- A HubSpot contact logged with the match and its identity confidence.
- A fit score against your target segment, with low-confidence matches flagged for review.

## Inputs

- `personal_email`: the personal email address to resolve, e.g. jane.doe@gmail.com
- `target_segment`: the kind of company that counts as a fit, e.g. Series A-B B2B SaaS in the US

## Steps

1. **Search for the person** with [exa/answer-question](../companies/exa/tools/answer-question.md). Ask who publicly holds `personal_email`'s handle or the name clues it gives, grounded in web sources. Keep the candidate's name, LinkedIn URL and claimed employer, with the citations.
2. **Corroborate the profile** with [exa/get-page-contents](../companies/exa/tools/get-page-contents.md). Read the candidate's LinkedIn or bio page directly. Keep whether it confirms the same employer and role step 1 found, as the identity confidence.
3. **Research the company** with [exa/search-web](../companies/exa/tools/search-web.md). Search the employer's own site and recent news for its industry, size and funding stage, for a fit check.
4. **Log the match** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update a contact for `personal_email` with the resolved name, employer and identity confidence, matched on email.
5. **Score and flag**. Give the match a fit score from whether step 3's company matches `target_segment`. Flag anything low-confidence or conflicting for manual review instead of guessing.

## Notes

This looks up public business identity only; discard anything below your confidence bar rather than logging it, and never treat a candidate step 2 couldn't confirm as resolved.

Adapted from ShipGTM's [personal email enrichment guide](https://shipgtm.substack.com/p/unlocking-company-data-from-personal), which uses the Exa API for people and company research and HubSpot as the CRM of record.
