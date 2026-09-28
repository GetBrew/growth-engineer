---
name: Retrieve responses
summary: Returns a form's responses with their answers and landing and submission times, filtered by date, response type or a search phrase.
notes: "Forms with more than 1,000 responses need narrower `since` and `until` ranges or the `before` and `after` cursors. Responses from the last 30 minutes or so may be missing: use a webhook for real-time leads."
capability: collect-responses
docs: https://www.typeform.com/developers/responses/reference/retrieve-responses/
api: GET /forms/{form_id}/responses
updated: 2026-09-27
---
