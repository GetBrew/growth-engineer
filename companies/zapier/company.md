---
name: Zapier
domain: zapier.com
category: automation
tagline: Run actions in 9,000+ apps through the connections saved in a Zapier account.
docs: https://docs.zapier.com
github: https://github.com/zapier
logo: https://cdn.growth.engineer/icons/companies/zapier-c8df1af9.png
mcp:
  url: https://mcp.zapier.com/api/v1/connect
  auth: oauth
  docs: https://docs.zapier.com/mcp/overview/how-connections-work
cli:
  install: npm install -g @zapier/zapier-sdk-cli
  binary: zapier-sdk
  auth: oauth
  docs: https://docs.zapier.com/sdk/using-the-cli
updated: 2026-09-27
---

Zapier is an automation platform with integrations for 9,000+ apps and 40,000+
actions. Its hosted MCP server and the `zapier-sdk` CLI let an agent find and
run those actions, such as sending a Slack message or looking up a contact,
through the app connections already saved in a Zapier account, so the agent
never handles a third-party API key. The MCP server signs in with OAuth from
inside the MCP client, and Zapier creates the server during that sign-in; in
its default agentic mode the agent discovers and enables actions itself. The
CLI signs in through the browser with `zapier-sdk login`. Each successful MCP
tool call uses two tasks from the Zapier plan.

Zapier's REST APIs on `api.zapier.com` serve partners that embed Zapier in
their own product: running an action through them needs a public Zapier
integration or White Label access.
