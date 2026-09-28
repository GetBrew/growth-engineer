---
name: Create CMS items
summary: Creates up to 100 items in a CMS collection, as drafts unless queued for the next site publish, and returns them with their IDs.
notes: "Read the collection's fields first (`get_collection_details` on MCP). Setting `isDraft` to `false` only queues items for the next site publish: publish them to go live now. The 100-item limit counts every locale variant."
capability: publish-content
docs: https://developers.webflow.com/data/reference/cms/collection-items/staged-items/create-items
mcp: data_cms_tool
cli: webflow cms items create
api: POST /collections/{collection_id}/items/insert
updated: 2026-09-27
---
