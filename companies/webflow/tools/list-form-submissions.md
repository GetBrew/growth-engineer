---
name: List form submissions
summary: Returns the submissions of one form on a site, up to 100 per page.
notes: "A form inside a component yields one form per instance: to collect them all, list by site with `GET /sites/{site_id}/form_submissions` and the form's `elementId`."
capability: collect-responses
docs: https://developers.webflow.com/data/reference/forms/form-submissions/list-submissions
mcp: data_forms_tool
cli: webflow forms submissions
api: GET /sites/{site_id}/forms/{form_id}/submissions
updated: 2026-09-27
---
