---
name: PostHog
domain: posthog.com
category: product-analytics
tagline: Product analytics, session replay, feature flags and experiments on one platform.
docs: https://posthog.com/docs
github: https://github.com/PostHog/posthog
logo: https://cdn.growth.engineer/icons/companies/posthog-60d803f4.jpg
mcp:
  url: https://mcp.posthog.com/mcp
  auth: oauth
  docs: https://posthog.com/docs/model-context-protocol
cli:
  install: npm install -g @posthog/cli@latest
  binary: posthog-cli
  auth: api_key
  env: POSTHOG_CLI_API_KEY
  keyUrl: https://app.posthog.com/settings/user-api-keys?preset=mcp_server
  docs: https://posthog.com/docs/cli
api:
  url: https://us.posthog.com
  auth: api_key
  env: POSTHOG_PERSONAL_API_KEY
  keyUrl: https://us.posthog.com/settings/user-api-keys
  docs: https://posthog.com/docs/api
updated: 2026-09-27
---

PostHog is a product platform that combines product and web analytics, session replay, feature flags, experiments, surveys, error tracking and a CDP in one place.

The API URL above is US Cloud; EU Cloud projects use `https://eu.posthog.com`. The hosted MCP server routes to the right region from the account you sign in with.

The CLI reads its key as `POSTHOG_CLI_API_KEY` and the API as
`POSTHOG_PERSONAL_API_KEY`: each is the name that way's docs use.
