---
name: Create a Confluence page
summary: Creates a page in a Confluence space, under a parent page if you pass one, and returns the new page.
notes: Needs the space's `spaceId`. The page publishes immediately unless `status` is `draft`, and a published page needs a `title`.
capability: manage-docs
docs: https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/#api-pages-post
mcp: createConfluenceContent
api: POST /wiki/api/v2/pages
updated: 2026-09-27
---
