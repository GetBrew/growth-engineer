---
name: Import leads from SuperSearch
summary: Adds the people matching a SuperSearch query to an Instantly lead list, creating the list if needed, and enriches them with work emails or LinkedIn profiles as you ask.
capability: build-audience
docs: https://developer.instantly.ai/api-reference/supersearchenrichment/enrich-leads-from-supersearch
api: POST /api/v2/supersearch-enrichment/enrich-leads-from-supersearch
updated: 2026-09-27
---

Pass `search_filters` (the same shape as the preview), a `limit`, and either
`resource_id` for an existing list or `list_name` for a new one. Turn on
`work_email_enrichment` for work emails and `fully_enriched_profile` for
LinkedIn profile data, and set `skip_rows_without_email` to drop people
without an email. Preview or count the matches first so the import brings in
the people you expect.
