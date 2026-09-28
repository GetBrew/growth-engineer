---
name: Generate a post
summary: Queues a job that drafts a changelog, blog post, LinkedIn post or X post from recent GitHub and Linear activity in the brand's voice.
notes: "Returns a `jobId`; poll `get_post_generation_status` (`GET /v1/posts/generate/{jobId}`) until the draft is ready. `lookback` picks the activity window, from `current_day` to `last_30_days`."
capability: write-copy
docs: https://docs.usenotra.com/api-reference/content/queue-async-post-generation
mcp: generate_post
cli: notra posts generate
api: POST /v1/posts/generate
updated: 2026-09-28
---
