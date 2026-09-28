---
name: People Data Labs
domain: peopledatalabs.com
category: data-provider
tagline: Person and company data APIs for enrichment, search and IP-to-company lookups.
docs: https://docs.peopledatalabs.com
github: https://github.com/peopledatalabs
api:
  url: https://api.peopledatalabs.com
  auth: api_key
  env: PDL_API_KEY
  header: X-Api-Key
  keyUrl: https://dashboard.peopledatalabs.com/api-keys
  docs: https://docs.peopledatalabs.com/docs/authentication
updated: 2026-09-27
---

People Data Labs (PDL) is a B2B data provider. Its REST API matches people
against a dataset of nearly three billion profiles and companies against its
company records, searches both with Elasticsearch or SQL queries, and resolves
IP addresses to the companies behind them. Official SDKs cover Python,
JavaScript, Ruby, Go and Rust.

The API takes a key in the `X-Api-Key` header. Enrichment is charged per
match and search per record returned. The free plan is meant for testing and
returns contact fields such as emails, phone numbers and street-level
locations only as true/false flags; a paid Pro plan returns their values.
