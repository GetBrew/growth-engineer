---
name: Export images
summary: Renders frames or layers from a file as PNG, JPG, SVG or PDF and returns temporary URLs to download them.
notes: Pass the IDs of the nodes to render. REST image URLs expire after 30 days, and the MCP tool takes up to 20 nodes per call.
capability: design-assets
docs: https://developers.figma.com/docs/rest-api/file-endpoints/#get-images-endpoint
mcp: download_assets
api: GET /v1/images/{key}
updated: 2026-09-26
---
