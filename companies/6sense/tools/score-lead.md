---
name: Score a lead
summary: Returns 6sense's predictive scores for a lead's email for each product, with intent score, buying stage, profile fit and whether the account is a 6QA.
capability: track-intent
docs: https://api.6sense.com/docs/#lead-scoring-api
status: draft
updated: 2026-09-27
---

Draft: the Lead Scoring API is `POST https://scribe.6sense.com/v2/people/score`,
on a different host from the API this company declares
(`https://api.6sense.com`), so the call can't be written as a path on it yet.
It takes a form-encoded `email` and `country`, needs the 6sense Advanced
package, and uses its own Lead Scoring API token.
