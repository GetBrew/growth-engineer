---
name: Find a person's email or phone
summary: Starts a lookup that finds a person's verified email, phone number or LinkedIn profile, or verifies an email you have, and returns an id to fetch the result with.
notes: "Runs asynchronously: fetch the result with `GET /enrich/{enrichId}` or pass a `webhookUrl`. Each enrichment spends credits, so confirm before running it on many people."
capability: find-work-emails
docs: https://developer.lemlist.com/api-reference/endpoints/enrich/enrich-data
cli: lemlist api POST /enrich
api: POST /enrich
updated: 2026-09-27
---
