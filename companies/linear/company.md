---
name: Linear
domain: linear.app
category: project-management
tagline: The system for product development, built for planning and building with AI agents.
docs: https://linear.app/developers
github: https://github.com/linear
logo: https://cdn.growth.engineer/icons/companies/linear-6d49f807.svg
mcp:
  url: https://mcp.linear.app/mcp
  auth: oauth
  docs: https://linear.app/docs/mcp
api:
  url: https://api.linear.app
  auth: api_key
  env: LINEAR_API_KEY
  header: Authorization
  keyUrl: https://linear.app/settings/account/security
  docs: https://linear.app/developers/graphql
updated: 2026-09-27
---

Linear is where product teams and AI agents plan and build: issues, projects,
cycles, initiatives and documents, plus Customer Requests that tie feedback
from customers to the work it asks for. Its hosted MCP server finds, creates
and updates issues, projects, comments and documents. It signs in with OAuth,
and also accepts a Linear API key as a bearer token; connect to
`https://mcp.linear.app/mcp/readonly` for read tools only.

The API is GraphQL only: every call is a `POST` to
`https://api.linear.app/graphql` with a query or mutation in the body. A
personal API key goes in the `Authorization` header as is, without `Bearer`;
an OAuth access token is sent as `Bearer <token>`.
