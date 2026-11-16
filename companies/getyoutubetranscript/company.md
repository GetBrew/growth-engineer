---
name: GetYouTubeTranscript
domain: getyoutubetranscript.com
category: data-provider
tagline: YouTube transcripts, search and channel data for agents, from one API, MCP server or CLI.
docs: https://getyoutubetranscript.com/docs
github: https://github.com/tubeagentkit
logo: https://cdn.growth.engineer/icons/companies/getyoutubetranscript-c2855b3a.png
mcp:
  url: https://getyoutubetranscript.com/api/mcp
  auth: oauth
  docs: https://github.com/tubeagentkit/youtube-mcp
cli:
  install: npm install -g @tubeagentkit/cli
  binary: gyt
  auth: api_key
  env: GYT_API_KEY
  keyUrl: https://getyoutubetranscript.com/dashboard
  docs: https://github.com/tubeagentkit/youtube-transcript-cli
api:
  url: https://getyoutubetranscript.com/api/v1
  auth: api_key
  env: GYT_API_KEY
  keyUrl: https://getyoutubetranscript.com/dashboard
  docs: https://getyoutubetranscript.com/docs
  notes: "Transcripts, searches and channel video pages cost 1 credit each, and failed requests cost nothing. `GET /credits` is free, the cheapest check of a key. New accounts get 100 free credits, no card."
status: published
updated: 2026-11-16
---

GetYouTubeTranscript returns the transcript of a YouTube video as text or JSON,
with optional timestamps, in any caption language the video has. It also
searches YouTube and lists a channel's uploads and a playlist's videos, so an
agent can research what creators and competitors say in their videos. It reads
the captions a video already has; it does not run speech-to-text.
