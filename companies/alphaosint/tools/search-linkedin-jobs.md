---
name: Search LinkedIn jobs
summary: Returns public LinkedIn job listings by keyword, location, seniority and job type, or for given job URLs, with title, company, salary, description and apply link.
notes: maxJobs (default 25, up to 500) caps each search. jobType, experienceLevel and remote are applied after fetching, and jobs they skip are not charged. Billed per job returned.
capability: track-intent
docs: https://alphaosint.com/sources/linkedin-jobs-api/
mcp: johnvc--linkedin-jobs-api
api: POST /acts/johnvc~linkedin-jobs-api/run-sync-get-dataset-items
updated: 2026-11-02
---
