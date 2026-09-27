---
name: Search messages
summary: Searches messages and files in public channels, narrowed by channel, person and date.
capability: research-accounts
docs: https://github.com/slackapi/slack-skills-plugin/blob/main/skills/slack-search/SKILL.md
mcp: slack_search_public
updated: 2026-09-26
---

Use it to see what the team has already said about an account before reaching out; narrow a query with `in:`, `from:`, `before:` and `after:`. `slack_search_public_and_private` also covers private channels and DMs, with the user's consent. The Web API's `search.messages` needs a user token, so it is not listed here beside the bot-token API.
