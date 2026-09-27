---
name: Asana
domain: asana.com
category: project-management
tagline: Work management for tasks, projects and portfolios.
docs: https://developers.asana.com
github: https://github.com/Asana
logo: asana.png
mcp:
  url: https://mcp.asana.com/v2/mcp
  auth: oauth
  docs: https://developers.asana.com/docs/using-asanas-mcp-server
api:
  url: https://app.asana.com/api/1.0
  auth: api_key
  env: ASANA_ACCESS_TOKEN
  keyUrl: https://app.asana.com/0/my-apps
  docs: https://developers.asana.com/reference/rest-api-reference
updated: 2026-09-27
---

Asana is work management software for teams and AI agents. Its V2 MCP server
and its REST API read and write the Work Graph: tasks, projects, portfolios,
goals and the people they are assigned to. Coding clients such as Claude Code
or Cursor connect to the MCP server through an OAuth app you register in the
Asana developer console; the API takes a personal access token.
