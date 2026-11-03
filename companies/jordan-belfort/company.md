---
name: Jordan Belfort
domain: jordan-apis.surge.sh
category: data-provider
tagline: Job postings from companies' own career sites (Greenhouse, Lever, Ashby, Workday and four more ATSs), searchable by keyword, run as Apify Actors over MCP or a REST API.
docs: https://apify.com/jordan-belfort/ats-jobs-api
mcp:
  url: https://mcp.apify.com/?tools=jordan-belfort/ats-jobs-api
  auth: oauth
  docs: https://docs.apify.com/integrations/mcp
  notes: "Apify's hosted MCP server; the URL loads one tool, named jordan-belfort--ats-jobs-api. Sign in to Apify in the browser, or send an Apify token as a Bearer header. A search run takes 30-90 seconds."
api:
  url: https://api.apify.com/v2
  auth: api_key
  env: APIFY_TOKEN
  keyUrl: https://console.apify.com/settings/integrations
  docs: https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post
  notes: "POST the Actor's JSON input; the response holds the job rows. Runs bill to the Apify account at $0.001 per job returned."
updated: 2026-11-03
---

Jordan Belfort publishes job-data Actors on the Apify Store. The main one keeps a
daily index of 15,000+ public company job boards on eight applicant tracking
systems (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Recruitee, Personio,
Teamtailor), 900,000+ open jobs, read from each
system's public job-board API or careers site.

Hiring is a buying signal: a search for a role across every indexed company
returns who is hiring for it now, with the employer's own posting URL, location
and country, remote or on-site, posted pay range, seniority and publish date.
Given company names or careers URLs instead, the same Actor returns those
companies' open jobs, Workable boards included.
