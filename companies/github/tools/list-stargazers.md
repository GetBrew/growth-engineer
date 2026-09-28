---
name: List stargazers
summary: Returns the users who starred a repository, optionally with when each star was created.
notes: "Send `Accept: application/vnd.github.star+json` to get each star's `starred_at` timestamp."
capability: find-prospects
docs: https://docs.github.com/en/rest/activity/starring#list-stargazers
api: GET /repos/{owner}/{repo}/stargazers
updated: 2026-09-26
---
