---
name: Search job postings across company career sites
summary: Returns the newest job postings whose title matches a keyword, across 15,000+ company career sites, with company, location, country codes, remote or on-site, posted salary, seniority and the employer's posting URL.
notes: "searchKeywords is required and maxResults caps the run (default 100); filters include countries, workplaceType, minSalary, seniority, atsSystems and postedWithinDays. Billed per job returned; filtered-out jobs are free. The index is rebuilt daily."
capability: track-intent
docs: https://apify.com/jordan-belfort/ats-jobs-api
mcp: jordan-belfort--ats-jobs-api
api: POST /acts/jordan-belfort~ats-jobs-api/run-sync-get-dataset-items
updated: 2026-11-03
---
