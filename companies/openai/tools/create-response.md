---
name: Create a response
summary: Generates text, or JSON that follows a schema you pass, from a prompt, optionally using tools such as web search.
capability: write-copy
docs: https://developers.openai.com/api/reference/resources/responses/methods/create
cli: openai responses create
api: POST /responses
aliases:
  - openai/write-copy
  - openai/classify-signals
updated: 2026-09-26
---

Draft copy with a plain prompt. To classify records, pass a JSON schema in `text.format` (structured outputs) and read the label from the returned JSON.
