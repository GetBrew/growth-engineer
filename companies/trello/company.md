---
name: Trello
domain: trello.com
category: project-management
tagline: Track the follow-up on a board.
docs: https://developer.atlassian.com/cloud/trello/
logo: trello.png
mcp:
  url: https://mcp.trello.com/v1
  auth: oauth
  docs: https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/
api:
  url: https://api.trello.com/1
  auth: oauth
  docs: https://developer.atlassian.com/cloud/trello/rest/
updated: 2026-09-26
---

Trello is a visual collaboration platform that helps teams organize work, track projects, and streamline workflows using boards, lists, and cards.

The MCP server works on any Trello plan and connects to one workspace per authorization. It can search boards and cards, create and update cards and checklists, move cards and lists, and archive cards, but it cannot delete anything. The REST API takes OAuth 2.0 bearer tokens since September 2026, and still accepts the older API key and token pair.
