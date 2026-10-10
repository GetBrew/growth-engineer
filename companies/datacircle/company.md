---
name: Datacircle
domain: datacircle.dev
category: data-provider
tagline: "A data co-op: B2B data APIs with no markup"
docs: https://docs.datacircle.dev
logo: https://cdn.growth.engineer/icons/companies/datacircle-50dc829e.jpg
mcp:
  url: https://api.datacircle.dev/mcp
  auth: oauth
  docs: https://docs.datacircle.dev/mcp-server
  notes: The first time, your client signs you in with your Datacircle email (OAuth). Each tool makes one REST call and costs what that call costs, from the same balance.
api:
  url: https://api.datacircle.dev
  auth: api_key
  env: DATACIRCLE_API_KEY
  scheme: Token
  keyUrl: https://datacircle.dev/login
  docs: https://docs.datacircle.dev/quickstart
  notes: Send the provider's own request with an X-Data-Provider header naming it (up2data, harvestapi or fetchin). Every JSON answer adds datacircle_meta, with the call's cost and the balance left; a balance that can't cover the call answers 402.
updated: 2026-10-10
---

Datacircle is a data co-op: it passes requests to B2B data providers' APIs
at the providers' own prices, with no markup. An agent sends the provider's
own request to api.datacircle.dev with a Datacircle key and an
`X-Data-Provider` header, and each request fetches the data live.

Three LinkedIn profile APIs are live: Up2Data, HarvestAPI and Fetchin.
Workspaces that have added $50 in funds also get a flat file every morning of
their data plus every other member's. A new account signed up with a work
email starts with a $5 credit.
