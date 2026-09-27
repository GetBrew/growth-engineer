---
name: Slack
domain: slack.com
category: messaging
tagline: Where the team already is — route signals to the right channel.
docs: https://docs.slack.dev
github: https://github.com/slackapi
logo: slack.jpg
mcp:
  url: https://mcp.slack.com/mcp
  auth: oauth
  docs: https://docs.slack.dev/ai/slack-mcp-server/
cli:
  install: curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash
  binary: slack
  auth: api_key
  env: SLACK_BOT_TOKEN
  keyUrl: https://api.slack.com/apps
  docs: https://docs.slack.dev/tools/slack-cli/
api:
  url: https://slack.com/api
  auth: api_key
  env: SLACK_BOT_TOKEN
  keyUrl: https://api.slack.com/apps
  docs: https://docs.slack.dev/apis/web-api/
updated: 2026-09-26
---

Slack is a collaboration platform that unifies messaging, file sharing, and workflow automation for teams of all sizes.

The MCP server acts as the signed-in user, and a workspace admin must approve MCP access first. The Web API and the CLI's `slack api` command call the same methods with a bot token (`xoxb-`) from an app installed in the workspace; `slack api` reads it from `SLACK_BOT_TOKEN`.
