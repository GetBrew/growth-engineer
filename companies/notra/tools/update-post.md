---
name: Update or publish a post
summary: Changes a post's title, slug, markdown or status, and publishes it when the status is set to `published`.
notes: Sending markdown re-renders the stored HTML. Slugs are accepted only for blog posts and changelogs.
capability: publish-content
docs: https://docs.usenotra.com/api-reference/content/update-a-single-post
mcp: update_post
cli: notra posts update
api: PATCH /v1/posts/{postId}
updated: 2026-09-28
---
