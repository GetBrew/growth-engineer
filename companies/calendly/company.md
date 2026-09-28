---
name: Calendly
domain: calendly.com
category: scheduling
tagline: Meeting scheduling software for booking links, open times and booked meetings.
docs: https://developer.calendly.com
github: https://github.com/calendly
mcp:
  url: https://mcp.calendly.com
  auth: oauth
  docs: https://developer.calendly.com/docs/mcp/calendly-mcp-server
api:
  url: https://api.calendly.com
  auth: api_key
  env: CALENDLY_API_KEY
  keyUrl: https://calendly.com/integrations/api_webhooks
  docs: https://developer.calendly.com/api-docs/overview/api/reference
updated: 2026-09-27
---

Calendly is meeting scheduling software that covers the work around a
meeting, from scheduling and payments to meeting prep, notetaking, contact
management and follow-up. Its hosted MCP server and REST API v2 read and
update event types and availability, create single-use scheduling links,
book invitees directly through the Scheduling API, and list scheduled events
and their invitees.

The MCP server is hosted by Calendly and signs in with OAuth 2.1 through
dynamic client registration; it does not accept personal access tokens. The
API takes a personal access token, or an OAuth app's token, as a Bearer
token. Any Calendly plan can connect over MCP, but booking an invitee
directly needs a paid plan (Standard or above) and routing forms need Teams
or higher.
