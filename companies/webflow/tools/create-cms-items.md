---
name: Create CMS items
summary: Creates up to 100 items in a CMS collection, as drafts unless queued for the next site publish, and returns them with their IDs.
capability: publish-content
docs: https://developers.webflow.com/data/reference/cms/collection-items/staged-items/create-items
mcp: data_cms_tool
cli: webflow cms items create
api: POST /collections/{collection_id}/items/insert
updated: 2026-09-27
---

On the MCP server, use the `create_collection_items` action of
`data_cms_tool` with `collection_id` and each item's `fieldData`; read the
collection's fields first with `get_collection_details`. Items are drafts
unless `isDraft` is `false`, which queues them for the next site publish;
publish them to put them live now. The 100-item limit counts every locale
variant. The CLI takes `--collection` and `--data` as JSON, plus `--draft`
to keep the item a draft.
