---
name: HeyReagent
domain: heyreagent.com
category: sales-engagement
tagline: A hosted MCP server and API that run actions on your own LinkedIn account, one at a time.
docs: https://heyreagent.com/docs
logo: https://cdn.growth.engineer/icons/companies/heyreagent-1b6ee215.svg
mcp:
  url: https://api.heyreagent.com/mcp
  auth: oauth
  docs: https://heyreagent.com/docs#mcp
  notes: "Claude and ChatGPT sign in to HeyReagent in the browser, with no key. Connect the LinkedIn account on heyreagent.com first. Each tool has the same name and inputs as the API action."
api:
  url: https://api.heyreagent.com
  auth: api_key
  env: HEYREAGENT_API_KEY
  keyUrl: https://heyreagent.com/t
  docs: https://heyreagent.com/docs
  notes: "Every action is a POST to /v1/actions/<name> with its inputs as a JSON body, reads included. Create the key under Menu, then Developers; it is shown once. An answer is { ok: true, result } or { ok: false, error, message }."
status: published
updated: 2026-10-25
---

HeyReagent runs LinkedIn actions on your own account: send a message or an
invitation, search people and posts, read a profile, publish a post or a
comment, and Sales Navigator, Recruiter and job-posting actions when the
account has those products. An agent calls one action at a time, as an MCP
tool or an HTTP call. The OpenAPI 3.1 file lists 97 actions and marks the 34
that change something on LinkedIn with `x-changes-something`.

Each LinkedIn account has a daily limit per kind of action, such as 100
messages, and an action past one is refused with the time it resets;
`get_usage` shows what is left. Every account starts on the free plan, where
LinkedIn is disconnected after an hour without use and 12 hours after
connecting at the latest. The Connect plan keeps it connected, so scheduled
workflows run. HeyReagent is not affiliated with LinkedIn.
