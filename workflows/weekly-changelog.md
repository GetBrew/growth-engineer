---
title: Publish a changelog of what shipped this week
summary: Drafts a changelog of the week's GitHub and Linear work in Notra, shows it to you for edits, and publishes it once you approve.
author: thedogwiththedataonit
motion: content
tags:
  - channel:website
updated: 2026-09-29
---

## Outcome

- A changelog of the week's work, drafted by Notra in your brand's voice.
- The changelog published in Notra after you approve it, with any edits you asked for.

## Inputs

- `lookback`: the stretch of work to cover, one of Notra's lookback windows, e.g. last_7_days

## Steps

1. **Draft the changelog** with [notra/generate-post](../companies/notra/tools/generate-post.md). Queue a post with `contentType` set to `changelog` and `lookbackWindow` set to `lookback`, then poll the job until it is `completed`, `failed` or `skipped`. Keep its `postId`; if the job did not complete, tell the user why and stop.
2. **Review the draft**. Read the post Notra made and show its title and markdown to the user. Make the edits they ask for, and keep the final title and markdown.
3. **Publish** with [notra/update-post](../companies/notra/tools/update-post.md). After the user approves, update the post with the final title and markdown, and set `status` to `published`.

## Notes

Notra drafts from the GitHub and Linear integrations connected to your organization. Run it once a week, after your last release.
