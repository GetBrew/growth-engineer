---
name: Update CMS items
summary: Updates the fields of one or more items in a CMS collection, holding changes to published items in draft until they are published.
capability: publish-content
docs: https://developers.webflow.com/data/reference/cms/collection-items/staged-items/update-items
mcp: data_cms_tool
cli: webflow cms items update
api: PATCH /collections/{collection_id}/items
updated: 2026-09-27
---

On the MCP server, use the `update_collection_items` action of
`data_cms_tool` with `collection_id` and each item's `id` and `fieldData`;
the CLI updates one item at a time with `--collection`, `--item` and
`--data`. A published item keeps its live version and shows "Changes in
draft" until you publish it, so follow an update with a publish when the
change should go live.
