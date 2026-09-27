---
name: List form submissions
summary: Returns the submissions of one form on a site, up to 100 per page.
capability: collect-responses
docs: https://developers.webflow.com/data/reference/forms/form-submissions/list-submissions
mcp: data_forms_tool
cli: webflow forms submissions
api: GET /sites/{site_id}/forms/{form_id}/submissions
updated: 2026-09-27
---

On the MCP server, use the `list_form_submissions` action of
`data_forms_tool` with `site_id` and `form_id`; its `list_forms` action finds
the form. Page with `offset` and `limit`. A form placed inside a component
yields one form per instance: to collect them all, list by site with
`GET /sites/{site_id}/form_submissions` and the form's `elementId`. The CLI
can export submissions to CSV with `--output`.
