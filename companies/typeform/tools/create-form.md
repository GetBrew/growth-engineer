---
name: Create a form
summary: Creates a typeform in a workspace, an empty draft over MCP or a complete form with fields and logic over the API.
notes: "Over MCP the form is empty: add fields with `forms-public_patch_form`, which stay in draft until `forms-public_publish_form`. Over the API, images in the definition must already be in the account."
capability: collect-responses
docs: https://www.typeform.com/developers/create/reference/create-form/
mcp: forms-public_create_form
api: POST /forms
updated: 2026-09-27
---
