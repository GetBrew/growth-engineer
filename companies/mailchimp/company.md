---
name: Mailchimp
domain: mailchimp.com
category: email
tagline: Email and SMS marketing platform, with audiences, campaigns and automation flows.
docs: https://mailchimp.com/developer/
github: https://github.com/mailchimp
api:
  url: https://{dc}.api.mailchimp.com/3.0
  auth: api_key
  env: MAILCHIMP_API_KEY
  keyUrl: https://us1.admin.mailchimp.com/account/api/
  docs: https://mailchimp.com/developer/marketing/api/
  notes: "`{dc}` is your data center, the part of the API key after the dash, such as `us6`."
updated: 2026-09-27
---

Mailchimp is an email and SMS marketing platform. Its Marketing API manages
audiences of contacts, organized with tags, segments and events, and creates
and sends campaigns.

`{dc}` in the API URL is your account's data center, such as `us6`: the part
of the API key after the dash. The key works as a Bearer token (HTTP Basic
auth with any username also works), and an account gets 10 simultaneous
connections. Transactional email (formerly Mandrill) is a separate API at
`https://mandrillapp.com/api/1.0` with its own key; its MCP server at
`https://mandrillapp.com/mcp` takes that key as a Bearer token.
