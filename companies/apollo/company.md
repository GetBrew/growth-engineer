---
name: Apollo
domain: apollo.io
category: data-provider
tagline: Contact data, work emails and outbound sequences in one place.
docs: https://docs.apollo.io
github: https://github.com/apolloio
logo: https://cdn.growth.engineer/icons/companies/apollo-25ae17ed.png
mcp:
  url: https://mcp.apollo.io/mcp
  auth: oauth
  docs: https://docs.apollo.io/docs/apollo-mcp
cli:
  install: brew install apolloio/apollo-io-cli/apollo-io-cli
  binary: apollo
  auth: oauth
  docs: https://docs.apollo.io/docs/apollo-cli-overview
api:
  url: https://api.apollo.io/api/v1
  auth: api_key
  env: APOLLO_API_KEY
  header: x-api-key
  keyUrl: https://developer.apollo.io/#/keys
  docs: https://docs.apollo.io/reference/apollo-api
updated: 2026-09-26
---

Apollo is a sales intelligence and engagement platform with a database of
over 240 million contacts and 30 million companies. Its MCP server, the
`apollo` CLI and the REST API search and enrich people and companies, manage
contacts, accounts and deals, and enroll contacts in outbound sequences. The
MCP server and the CLI sign in with OAuth; the API takes an API key, and the
Apollo plan decides which endpoints it can call and what they cost in credits.
