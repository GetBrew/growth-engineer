---
name: Search Confluence with CQL
summary: Returns the Confluence pages, blog posts and other content that match a CQL query.
notes: CQL here no longer supports user fields such as `user` or `user.accountid`. When more results exist, follow the cursor in the response's `next` link.
capability: manage-docs
docs: https://developer.atlassian.com/cloud/confluence/rest/v1/api-group-search/#api-wiki-rest-api-search-get
mcp: searchConfluence
api: GET /wiki/rest/api/search
updated: 2026-09-27
---
