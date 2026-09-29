---
name: ClickUp
domain: clickup.com
category: project-management
tagline: The everything app for work, with tasks, docs, goals and chat in one workspace.
docs: https://developer.clickup.com
github: https://github.com/clickup
logo: https://cdn.growth.engineer/icons/companies/clickup-fb450234.png
mcp:
  url: https://mcp.clickup.com/mcp
  auth: oauth
  docs: https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server
api:
  url: https://api.clickup.com/api
  auth: api_key
  env: CLICKUP_API_KEY
  header: Authorization
  keyUrl: https://app.clickup.com/settings/apps
  docs: https://developer.clickup.com/docs/authentication
updated: 2026-09-27
---

ClickUp keeps tasks, docs, goals and chat in one Workspace, organized into
Spaces, Folders and Lists. Its MCP server, in public beta on every plan,
searches, creates and updates tasks, and works with comments, docs, time
tracking and Chat. It signs in with OAuth only. Without the Everything AI
add-on, MCP calls are capped per rolling 24 hours: 50 on the Free Forever plan
and 300 on Unlimited and above; with it, the API's own rate limits apply.

The REST API takes a personal token, which starts with `pk_`, in the
`Authorization` header as is; OAuth apps send `Bearer <token>` instead. Most
endpoints are v2 and newer ones, such as Chat, are v3, both under the base URL
above. In v2 paths a Workspace is called a team.
