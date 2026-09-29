---
name: Front
domain: front.com
category: support
tagline: Customer service platform that handles email, SMS, chat and other channels in one place.
docs: https://dev.frontapp.com
github: https://github.com/frontapp
logo: https://cdn.growth.engineer/icons/companies/front-6e9bcb66.png
mcp:
  url: https://mcp.frontapp.com/mcp
  auth: oauth
  docs: https://dev.frontapp.com/docs/mcp-server
  notes: "Connect with the client ID and secret of a Front developer app that has MCP Server access: Front has no dynamic client registration."
api:
  url: https://api2.frontapp.com
  auth: api_key
  env: FRONT_API_KEY
  keyUrl: https://dev.frontapp.com/docs/create-and-revoke-api-tokens
  docs: https://dev.frontapp.com/reference/introduction
updated: 2026-09-27
---

Front is a customer service platform where teams work email, SMS, chat and
other channels as shared conversations, with internal comments, tags and
assignment. Its hosted MCP server, in open beta, acts as the Front teammate who
authorizes it, with that teammate's permissions and the `read`, `write` and
`send` scopes. Front does not support Dynamic Client Registration: create a
developer app with an OAuth feature (Settings, Company, Developer), enable MCP
Server feature access, and connect the AI client with that app's client ID and
secret. Claude and ChatGPT can connect from their official connector
directories instead.

The Core API takes a company-level API token as a Bearer token. An admin
creates it under Settings, Developers, API Tokens, and its features,
namespaces and permissions decide what it reaches; sending messages needs the
Send permission.
