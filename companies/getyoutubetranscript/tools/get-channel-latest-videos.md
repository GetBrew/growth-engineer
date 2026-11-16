---
name: List a channel's latest videos
summary: Returns a channel's details and its newest uploads from an @handle, channel URL or channel ID.
notes: "`GET /channel/latest` is free and returns the newest uploads in one response. `gyt channel` calls `GET /channel/videos` instead, which pages through the uploads with a `continuation` token at 1 credit a page."
capability: search-videos
docs: https://getyoutubetranscript.com/docs
mcp: get_channel_latest_videos
cli: gyt channel
api: GET /channel/latest
updated: 2026-11-16
---
