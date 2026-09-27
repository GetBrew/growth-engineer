---
name: ZoomInfo
domain: zoominfo.com
category: data-provider
tagline: Go-to-market intelligence to find and enrich companies and contacts and spot buyer intent.
docs: https://docs.gtm.ai
github: https://github.com/Zoominfo
logo: zoominfo.svg
mcp:
  url: https://mcp.zoominfo.com/mcp
  auth: oauth
  docs: https://docs.gtm.ai/docs/connect-to-zoominfo-mcp
cli:
  install: brew install zoominfo/gtm-ai/gtm-ai-cli
  binary: gtm
  auth: oauth
  docs: https://docs.gtm.ai/docs/zoominfo-cli
api:
  url: https://api.zoominfo.com/gtm
  auth: oauth
  docs: https://docs.gtm.ai/reference/api-overview
updated: 2026-09-27
---

ZoomInfo is a go-to-market intelligence platform with data on more than 100
million companies and 500 million professionals, plus buying and business
signals such as intent topics, news and scoops. Its MCP server, the `gtm` CLI
and the GTM API search and enrich companies and contacts, find companies
researching a topic and run AI account research, all on one backend with
shared credits.

Every way in needs a ZoomInfo license (GTM.ai self-serve or Enterprise), and
the plan decides which data, endpoints and credits are available. The MCP
server and the CLI sign in with OAuth in a browser. The API takes an OAuth 2.0
access token from an app created in the ZoomInfo Developer Portal, with the
client-credentials flow for server-to-server calls. Searches are free;
enriching a record costs one credit the first time in any 12 months.
