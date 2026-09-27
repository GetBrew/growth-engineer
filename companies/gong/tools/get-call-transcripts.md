---
name: Get call transcripts
summary: Returns the transcripts of the calls recorded in a date range, or of chosen calls, as monologues with each speaker's ID, topic and timed sentences.
capability: research-accounts
docs: https://help.gong.io/apidocs/retrieve-transcripts-of-calls-by-date-or-callids-v2callstranscript-2
api: POST /v2/calls/transcript
updated: 2026-09-27
---

Send a `filter` with `fromDateTime` and `toDateTime` in ISO-8601, and
`callIds` to keep only those calls; when more records remain, repeat the
request with the returned `cursor`. OAuth apps need the
`api:calls:read:transcript` scope. The MCP server does not return transcripts.
