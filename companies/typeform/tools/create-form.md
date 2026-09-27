---
name: Create a form
summary: Creates a typeform in a workspace, an empty draft over MCP or a complete form with fields and logic over the API.
capability: collect-responses
docs: https://www.typeform.com/developers/create/reference/create-form/
mcp: forms-public_create_form
api: POST /forms
updated: 2026-09-27
---

Over MCP the new form is empty: call `forms-public_get_capabilities`, then
`forms-public_validate_patch` and `forms-public_patch_form` to add fields,
and `forms-public_publish_form` only when the user wants it live, since
patched changes stay in the draft until then. The API takes the whole
definition (`title`, `fields`, `logic`, `hidden` fields, `workspace`) in one
request; any images in it must already be in the account.
