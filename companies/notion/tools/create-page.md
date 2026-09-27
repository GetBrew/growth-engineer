---
name: Create a page
summary: Creates a page under a parent page, or a new row in a data source, with property values and content.
capability: manage-docs
docs: https://developers.notion.com/reference/post-page
mcp: notion-create-pages
cli: ntn api v1/pages
api: POST /v1/pages
aliases:
  - notion/manage-docs
updated: 2026-09-26
---

To add a row to a database, set the parent to its data source and match the data source's property schema. `notion-create-pages` can create several pages in one call.
