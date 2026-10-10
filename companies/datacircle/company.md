---
name: Datacircle
domain: datacircle.dev
category: data-provider
tagline: "A data co-op: B2B data APIs with no markup"
docs: https://docs.datacircle.dev
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
  notes: Send the provider's own request with an X-Data-Provider header naming it (up2data, harvestapi or fetchin). Every JSON answer adds datacircle_meta, with the call's cost and the balance left; an empty balance answers 402.
updated: 2026-10-10
---

Datacircle is a data co-op. Query your favorite B2B data APIs through us.
Same request, same price, no markup. Every morning, you get the flat file of
your data plus everyone else's.

You send the provider's own request to api.datacircle.dev, with your
Datacircle key. That's the only change. Right now we have 3 live LinkedIn
profile APIs that we trust: Up2Data, HarvestAPI and Fetchin. Each request goes
to the provider and gets the profile as it is today.

Free: 10M+ U.S. B2B leads, as a flat file. Download it at datacircle.dev.
