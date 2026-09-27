---
name: Anthropic
domain: anthropic.com
category: ai-model
tagline: "Claude: models and agent tooling for drafting, reasoning and classification."
docs: https://platform.claude.com/docs/en/home
github: https://github.com/anthropics
logo: anthropic.png
cli:
  install: curl -fsSL https://claude.ai/install.sh | bash
  binary: claude
  auth: oauth
  docs: https://code.claude.com/docs/en/cli-reference
api:
  url: https://api.anthropic.com
  auth: api_key
  env: ANTHROPIC_API_KEY
  header: x-api-key
  keyUrl: https://platform.claude.com/settings/keys
  docs: https://platform.claude.com/docs/en/api/overview
updated: 2026-09-26
---

Anthropic is an AI safety and research company and the maker of Claude. The
Claude API gives programmatic access to Claude models and Claude Managed
Agents. Claude Code is its command-line agent: it signs in with a Claude or
Console account, or, when `ANTHROPIC_API_KEY` is set, asks you to approve
that key instead.
