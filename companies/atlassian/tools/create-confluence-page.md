---
name: Create a Confluence page
summary: Creates a page in a Confluence space, under a parent page if you pass one, and returns the new page.
capability: manage-docs
docs: https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/#api-pages-post
mcp: createConfluenceContent
api: POST /wiki/api/v2/pages
updated: 2026-09-27
---

`spaceId` is required, and a published page needs a `title`; pages publish
unless `status` is `draft`. Send the content as `body` with a
`representation`, such as `storage`. `createConfluenceContent` also creates
blog posts, live docs, whiteboards, databases and folders.
