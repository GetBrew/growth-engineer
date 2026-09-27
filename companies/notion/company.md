---
name: Notion
domain: notion.com
category: docs
tagline: Docs, wikis and databases in one AI workspace.
docs: https://developers.notion.com
github: https://github.com/makenotion
logo: notion.png
mcp:
  url: https://mcp.notion.com/mcp
  auth: oauth
  docs: https://developers.notion.com/guides/mcp/overview
cli:
  install: npm install --global ntn
  binary: ntn
  auth: api_key
  env: NOTION_API_TOKEN
  keyUrl: https://www.notion.so/developers/tokens
  docs: https://developers.notion.com/cli/get-started/overview
api:
  url: https://api.notion.com
  auth: api_key
  env: NOTION_API_KEY
  keyUrl: https://www.notion.so/developers/tokens
  docs: https://developers.notion.com/reference/intro
updated: 2026-09-27
---

Notion is an AI workspace for docs, wikis and databases, where teams build Custom Agents, search across their apps and automate busywork.

A database holds one or more data sources, and each row of a data source is a page. API requests also send a `Notion-Version` header; `ntn api` adds it for you.

One personal access token works for the CLI and the API: the CLI reads it as
`NOTION_API_TOKEN` and API requests as `NOTION_API_KEY`, each the name that
way's docs use.
