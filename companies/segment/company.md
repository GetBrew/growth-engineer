---
name: Segment
domain: segment.com
category: cdp
tagline: Customer data platform that collects events once and sends them to hundreds of tools.
docs: https://www.twilio.com/docs/segment
github: https://github.com/segmentio
logo: segment.svg
api:
  url: https://api.segment.io
  auth: api_key
  env: SEGMENT_API_KEY
  header: "Authorization: Basic"
  keyUrl: https://www.twilio.com/docs/segment/connections/find-writekey
  docs: https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api
updated: 2026-09-27
---

Twilio Segment is a customer data platform: it collects events and user
traits from websites, apps and servers, cleans them, and routes them to the
analytics, CRM and marketing tools connected as destinations. The HTTP
Tracking API records identify, track, group, page and batch calls for one
source and authenticates with that source's write key (in the source, open
Settings and then API Keys). Send it as Basic auth: `SEGMENT_API_KEY` holds
the base64 of the write key followed by a colon, `<write key>:`.

Workspaces in the EU send to `https://events.eu1.segmentapis.com` with a
write key from an EU workspace; Segment rejects data sent to the wrong
region. The Public API at `https://api.segmentapis.com`, which manages
sources, destinations and Engage audiences, takes a separate workspace token
and is not the API listed here.
