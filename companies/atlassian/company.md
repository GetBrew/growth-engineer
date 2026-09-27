---
name: Atlassian
domain: atlassian.com
category: project-management
tagline: Jira and Confluence, for tracking work and keeping team knowledge on one connected platform.
docs: https://developer.atlassian.com
github: https://github.com/atlassian
logo: atlassian.png
mcp:
  url: https://mcp.atlassian.com/v2/mcp
  auth: oauth
  docs: https://developer.atlassian.com/cloud/rovo-mcp/guides/getting-started/
cli:
  install: brew tap atlassian/homebrew-acli && brew install acli
  binary: acli
  auth: oauth
  docs: https://developer.atlassian.com/cloud/acli/guides/introduction/
api:
  url: https://{your-domain}.atlassian.net
  auth: api_key
  env: ATLASSIAN_API_KEY
  header: "Authorization: Basic"
  keyUrl: https://id.atlassian.com/manage-profile/security/api-tokens
  docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
updated: 2026-09-27
---

Atlassian makes Jira, for planning and tracking work, and Confluence, for docs
and team knowledge, alongside Loom, Bitbucket and Rovo AI agents; Trello is
listed on its own. The Rovo MCP server reads and writes Jira, Confluence,
Bitbucket, Loom and more with the signed-in user's permissions.
It lists a few primary tools up front, including every call named here, and
finds the rest at runtime through `discover`, which you then run with
`executeRead` or `executeWrite`. Some tools spend Rovo credits.

The `acli` CLI covers Jira; sign in with `acli jira auth login --web`. The Jira
and Confluence REST APIs live on your own site, where `your-domain` is its
name, and Confluence paths start with `/wiki`. They take basic auth:
`ATLASSIAN_API_KEY` holds the base64 of `<email>:<api token>` for a token
created without scopes. A scoped token calls
`https://api.atlassian.com/ex/jira/{cloudId}` instead.
