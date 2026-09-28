---
name: Zoom
domain: zoom.us
category: video
tagline: Video meetings and webinars, with chat and phone.
docs: https://developers.zoom.us
github: https://github.com/zoom
mcp:
  url: https://mcp.zoom.us/mcp/zoom/streamable
  auth: oauth
  docs: https://developers.zoom.us/docs/mcp/zoom/
  notes: "Create an OAuth app on the Zoom App Marketplace first: the server has no dynamic client registration, so your agent needs the app's client ID and secret."
api:
  url: https://api.zoom.us/v2
  auth: oauth
  docs: https://developers.zoom.us/docs/api/
  notes: Get the access token from an OAuth app you create on the Zoom App Marketplace. Webinar calls need a Pro or higher plan with the Webinar add-on.
updated: 2026-09-27
---

Zoom runs video meetings and webinars, with team chat and phone alongside.

Both the MCP server and the API sign in through an OAuth app you create on the Zoom App Marketplace. The MCP server does not support dynamic client registration, so the agent's client needs that app's client ID and secret. Webinar calls need a Pro or higher plan with the Webinar add-on.
