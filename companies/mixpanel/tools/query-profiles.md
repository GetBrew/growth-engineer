---
name: Query profiles
summary: Returns the user or group profiles that match a selector expression or belong to a cohort.
capability: build-audience
docs: https://docs.mixpanel.com/reference/engage-query
api: POST /engage
updated: 2026-09-26
---

Filter with a `where` selector or `filter_by_cohort`, and include `project_id`. Each response holds at most `page_size` records; page with the `session_id` from the first response and an incremented `page`.
