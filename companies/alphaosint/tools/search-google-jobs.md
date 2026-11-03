---
name: Search Google Jobs listings
summary: Returns Google Jobs listings for a query and place, with title, company, location, posting age, application links and the full description.
notes: query is required, and a city-level location works best. Billed per page of about 10 listings; num_results (default 100) and max_pagination cap a run.
capability: track-intent
docs: https://alphaosint.com/sources/google-jobs-api/
mcp: johnvc--Google-Jobs-Scraper
api: POST /acts/johnvc~Google-Jobs-Scraper/run-sync-get-dataset-items
updated: 2026-11-02
---
