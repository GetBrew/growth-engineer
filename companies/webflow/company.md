---
name: Webflow
domain: webflow.com
category: cms
tagline: Design, build and host websites, with a CMS, forms and SEO settings built in.
docs: https://developers.webflow.com
github: https://github.com/webflow
logo: webflow.png
mcp:
  url: https://mcp.webflow.com/mcp
  auth: oauth
  docs: https://developers.webflow.com/mcp/reference/overview
cli:
  install: npm install -g @webflow/webflow-cli
  binary: webflow
  auth: oauth
  docs: https://developers.webflow.com/cli/reference/webflow-cli
api:
  url: https://api.webflow.com/v2
  auth: api_key
  env: WEBFLOW_API_TOKEN
  docs: https://developers.webflow.com/data/reference/rest-introduction
updated: 2026-09-27
---

Webflow is a platform for designing, building and hosting websites, with a
CMS, forms and SEO settings built in. Its remote MCP server, the
`webflow` CLI and the Data API v2 create, update and publish CMS items,
publish sites and read form submissions; the MCP server can also build
pages, styles and components.

The MCP server signs in with OAuth, one workspace per authorization, and an
agent can do only what the user's Webflow role allows. `webflow auth login`
opens a browser sign-in and saves a `WEBFLOW_API_TOKEN` to the project's
`.env`; the CLI needs Node.js 22.13.0 or later. The Data API takes a site
token as a Bearer token: a site administrator creates it per site under the
site's settings, in Apps & integrations, API access.
