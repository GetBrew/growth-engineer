---
name: Zoom
domain: zoom.us
category: video
tagline: Book and run the call, then work the attendance list.
docs: https://developers.zoom.us
github: https://github.com/zoom
logo: zoom.jpg
mcp:
  url: https://mcp.zoom.us/mcp/zoom/streamable
  auth: oauth
  docs: https://developers.zoom.us/docs/mcp/zoom/
api:
  url: https://api.zoom.us/v2
  auth: oauth
  docs: https://developers.zoom.us/docs/api/
updated: 2026-09-26
---

Zoom is a global communications platform that provides video conferencing, online meetings, chat, phone, and webinar solutions for individuals and businesses.

Both the MCP server and the API sign in through an OAuth app you create on the Zoom App Marketplace. The MCP server does not support dynamic client registration, so the agent's client needs that app's client ID and secret. Webinar calls need a Pro or higher plan with the Webinar add-on.
