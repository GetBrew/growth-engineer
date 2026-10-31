---
name: Xquik
domain: xquik.com
category: scraper
tagline: Search public X (Twitter) posts, look up profiles, export followers and replies, and monitor accounts over REST, a CLI or MCP.
docs: https://docs.xquik.com
github: https://github.com/Xquik-dev
logo: https://cdn.growth.engineer/icons/companies/xquik-cc0ad234.png
mcp:
  url: https://xquik.com/mcp?codemode=false
  auth: oauth
  docs: https://docs.xquik.com/mcp/tools
  notes: "Native mode: one tool per API operation, named by its OpenAPI operationId. The plain https://xquik.com/mcp is Code Mode, with only docs, search, execute and whoami. Tools list before sign-in; the first tool call starts the OAuth sign-in."
cli:
  install: go install github.com/Xquik-dev/x-twitter-scraper-cli/cmd/x-twitter-scraper@latest
  binary: x-twitter-scraper
  auth: api_key
  env: X_TWITTER_SCRAPER_API_KEY
  keyUrl: https://dashboard.xquik.com/en/api-keys
  docs: https://docs.xquik.com/sdks/cli
  notes: "Needs Go, with `$(go env GOPATH)/bin` on PATH. The variable holds the same xq_ key the REST API takes."
api:
  url: https://xquik.com/api/v1
  auth: api_key
  env: XQUIK_API_KEY
  header: x-api-key
  keyUrl: https://dashboard.xquik.com/en/api-keys
  docs: https://docs.xquik.com/api-reference/overview
  notes: "Public reads need no X account; posting, DMs and private reads need one connected in the dashboard. Calls spend credits and a 402 means the balance is too low. A key always has the read scope; monitors and writes need their scopes added on the key."
status: published
updated: 2026-10-31
---

Xquik is a paid API for public X (Twitter) data. It searches posts, looks up
profiles, and exports followers, replies, timelines, lists and communities,
without an X account of your own. With an X account connected in its
dashboard, it can also post, like, follow and send direct messages. Account
and keyword monitors check X every second and send events to signed webhooks.
The same operations are available over REST, a CLI, SDKs and a remote MCP
server.

Calls are paid in credits. Most reads cost 1 credit per result returned, and
an active monitor costs 30 credits an hour. Plans run from USD 20 a month for
140,000 credits to USD 199 a month for 1,670,000 credits, unused credits carry
over, and extra credits cost USD 0.00015 each. Xquik is an independent service
and is not affiliated with X Corp.
