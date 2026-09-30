---
name: Coresignal
domain: coresignal.com
category: data-provider
tagline: Real-time public web data on companies, employees and job postings, over one API.
docs: https://docs.coresignal.com
logo: https://cdn.growth.engineer/icons/companies/coresignal-5854238b.png
api:
  url: https://api.coresignal.com/cdapi/v2
  auth: api_key
  header: apikey
  env: CORESIGNAL_API_KEY
  keyUrl: https://dashboard.coresignal.com
  docs: https://docs.coresignal.com/api-introduction/apis-overview
updated: 2026-09-29
---

Coresignal collects and refreshes company, employee and job-posting records
from public sources, searchable and enrichable over its Company, Employee
and Jobs APIs. It also runs a remote MCP server at
`https://mcp.coresignal.com/mcp/v2`, which signs in with OAuth through the
Coresignal dashboard; the older `https://mcp.coresignal.com/mcp`, which takes
the API key, is being retired.
