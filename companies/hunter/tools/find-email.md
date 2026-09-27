---
name: Find a person's email
summary: Returns the most likely work email for a person from their name and company domain or LinkedIn handle, with a confidence score, its verification status and the public sources.
capability: find-work-emails
docs: https://hunter.io/api-documentation/v2#email-finder
mcp: Email-Finder
api: GET /email-finder
updated: 2026-09-27
---

Pass `domain` (or `company`) with `first_name` and `last_name` or
`full_name`, or a `linkedin_handle` alone. Every email found is verified, and
a search that finds nothing costs no credit. A found email is also saved to
your Hunter leads unless that is turned off for the account. A `451` means the
person asked Hunter to stop processing their data: don't use it.
