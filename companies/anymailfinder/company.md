---
name: Anymail Finder
domain: anymailfinder.com
category: data-provider
tagline: Find and verify work emails by name and company, LinkedIn URL or role, and find the person behind an email.
docs: https://anymailfinder.com/email-finder-api/docs
mcp:
  url: https://api.anymailfinder.com/mcp
  auth: oauth
  docs: https://anymailfinder.com/integrations/mcp
api:
  url: https://api.anymailfinder.com/v5.1
  auth: api_key
  env: ANYMAILFINDER_API_KEY
  header: Authorization
  keyUrl: https://app.anymailfinder.com/settings/api
  docs: https://anymailfinder.com/email-finder-api/docs
  notes: "The key goes in Authorization as is, with no Bearer prefix. Searches can take up to 3 minutes; wait for the response instead of retrying. A 402 means the account is out of credits."
status: published
updated: 2026-11-07
---

Anymail Finder finds work email addresses and verifies them before returning
them, catch-all domains included. It finds a person's email from their name
and company or their LinkedIn URL, finds the decision maker in a department
when you only know the company, lists the emails at a company, verifies
addresses you already have, and finds the person behind an email. The hosted
MCP server covers the same calls; assistants sign in with OAuth.

Searches charge credits only when a verified email is found; a miss is free.
A verification costs 0.2 credits whatever the result, and repeating the same
search or verification within 30 days is free. Every response reports
`credits_charged`.
