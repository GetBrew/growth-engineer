---
name: Get a YouTube transcript
summary: Returns the transcript of one YouTube video, from a URL or video ID, with optional per-line timestamps and a caption language.
notes: "Costs 1 credit, with or without timestamps; `language` defaults to en. The free `GET /transcript/languages` lists a video's caption languages first: an empty list means captions are off and there is no transcript to get."
capability: get-video-transcripts
docs: https://getyoutubetranscript.com/docs
mcp: get_youtube_transcript
cli: gyt transcript
api: GET /transcript
updated: 2026-11-16
---
