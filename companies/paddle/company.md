---
name: Paddle
domain: paddle.com
category: payments
tagline: Merchant of record for SaaS, apps and AI products; payments, tax and subscriptions in one integration.
docs: https://developer.paddle.com
github: https://github.com/PaddleHQ
mcp:
  url: https://mcp.paddle.com/mcp
  auth: oauth
  docs: https://developer.paddle.com/sdks/ai/paddle-mcp
api:
  url: https://api.paddle.com
  auth: api_key
  env: PADDLE_API_KEY
  keyUrl: https://vendors.paddle.com/authentication-v2
  docs: https://developer.paddle.com/api-reference/about
updated: 2026-09-27
---

Paddle is a merchant of record for SaaS, mobile app, AI and digital product
companies: it takes care of payments, tax, fraud and compliance and manages
subscriptions in a single integration. These files cover Paddle Billing; the
legacy Paddle Classic is a separate product with a different API.

Instead of one tool per API operation, the hosted MCP server has three tools:
`search` finds an API method and its parameters, `execute` runs JavaScript that
chains one or more API calls, and `report_missing_tool` flags a gap to Paddle.
The live server signs in with OAuth and starts with read access to what your
Paddle role permits; grant write access, or remove the connection, under
Paddle > Connectors > MCP. The sandbox server
(`https://sandbox-mcp.paddle.com/mcp`) and sandbox API
(`https://sandbox-api.paddle.com`) take a sandbox API key instead. The API uses
Bearer API keys created under Paddle > Developer tools > Authentication, each
with only the permissions it needs.
