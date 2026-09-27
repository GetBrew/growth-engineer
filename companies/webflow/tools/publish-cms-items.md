---
name: Publish CMS items
summary: Publishes one or more items in a CMS collection, making them live on the site.
capability: publish-content
docs: https://developers.webflow.com/data/reference/cms/collection-items/staged-items/publish-item
mcp: data_cms_tool
cli: webflow cms items publish
api: POST /collections/{collection_id}/items/publish
updated: 2026-09-27
---

On the MCP server, use the `publish_collection_items` action of
`data_cms_tool` with `collection_id` and the `itemIds`; the CLI takes
`--collection` and a comma-separated `--items` list. Publishing a draft item
sets its `isDraft` to `false`.
