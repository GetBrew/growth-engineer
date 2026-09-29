---
name: Intercom
domain: intercom.com
category: support
tagline: Customer service helpdesk with a built-in AI agent, Fin.
docs: https://developers.intercom.com
github: https://github.com/intercom
logo: https://cdn.growth.engineer/icons/companies/intercom-7b3c4d8a.png
mcp:
  url: https://mcp.intercom.com/mcp
  auth: oauth
  docs: https://developers.intercom.com/docs/guides/mcp
api:
  url: https://api.intercom.io
  auth: api_key
  env: INTERCOM_API_KEY
  keyUrl: https://app.intercom.io/a/apps/_/developer-hub/app-packages
  docs: https://developers.intercom.com/docs/references/rest-api/api.intercom.io
updated: 2026-09-27
---

Intercom is a helpdesk with a natively integrated AI agent, Fin, built around
contacts (users and leads), companies and conversations. Its hosted MCP server
signs in with OAuth and searches and reads conversations, contacts, companies
and Help Center articles, creates and updates articles, and adds internal
notes. It serves US and EU workspaces: EU workspaces (`app.eu.intercom.com`)
use `https://mcp.eu.intercom.com/mcp`, and AU workspaces are not supported yet.

The REST API takes the access token of an app created in the Developer Hub
(Configure, then Authentication) as a Bearer token. EU and Australian
workspaces call `https://api.eu.intercom.io` and `https://api.au.intercom.io`.
Requests use the API version set on the app unless an `Intercom-Version`
header, such as `2.16`, overrides it.
