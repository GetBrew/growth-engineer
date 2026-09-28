---
name: Zendesk
domain: zendesk.com
category: support
tagline: AI-powered customer service platform, with an API for tickets, users and organizations.
docs: https://developer.zendesk.com
github: https://github.com/zendesk
logo: zendesk.svg
api:
  url: https://{subdomain}.zendesk.com
  auth: api_key
  env: ZENDESK_OAUTH_TOKEN
  keyUrl: https://developer.zendesk.com/documentation/authentication/oauth-migration/#getting-your-first-token
  docs: https://developer.zendesk.com/api-reference/ticketing/introduction/
  notes: "`{subdomain}` is your Zendesk subdomain, as in `acme.zendesk.com`. Tokens from OAuth clients created since April 30, 2026 expire after 30 minutes."
updated: 2026-09-27
---

Zendesk is a customer service platform. Its Support API, also called the
Ticketing API, manages tickets, users, organizations and search. `{subdomain}`
is the account's Zendesk subdomain, as in `acme.zendesk.com`; Zendesk's own
CLI reads it from `ZENDESK_SUBDOMAIN`.

Requests authenticate with an OAuth access token sent as a Bearer token,
`ZENDESK_OAUTH_TOKEN` being the name Zendesk's CLI uses for one. Register an
OAuth client in Admin Center, then get the first token with the one-time
browser setup. Tokens from clients created on or after April 30, 2026 expire
after 30 minutes by default and come with a refresh token. API tokens, sent
with Basic auth, are being retired: accounts can't create new ones after
October 27, 2026, and all of them stop working on April 30, 2027. Zendesk
announced its own MCP server for early access in May 2026.
