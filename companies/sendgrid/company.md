---
name: SendGrid
domain: sendgrid.com
category: email
tagline: Twilio's email API and marketing campaigns, with contacts, lists, segments and Single Sends.
docs: https://www.twilio.com/docs/sendgrid
github: https://github.com/sendgrid
logo: https://cdn.growth.engineer/icons/companies/sendgrid-23a92fd5.png
cli:
  install: brew tap twilio/brew && brew install twilio
  binary: twilio
  auth: api_key
  env: SENDGRID_API_KEY
  keyUrl: https://app.sendgrid.com/settings/api_keys
  docs: https://www.twilio.com/docs/twilio-cli/examples/send-email-sendgrid
api:
  url: https://api.sendgrid.com
  auth: api_key
  env: SENDGRID_API_KEY
  keyUrl: https://app.sendgrid.com/settings/api_keys
  docs: https://www.twilio.com/docs/sendgrid/api-reference
updated: 2026-09-27
---

Twilio SendGrid sends transactional email through its v3 Mail Send API and
runs Marketing Campaigns: contacts, lists and segments, and Single Sends to
them.

The CLI is the Twilio CLI, whose built-in SendGrid commands send email with
`SENDGRID_API_KEY`. EU regional subusers send mail through
`https://api.eu.sendgrid.com`. Twilio's MCP server at
`https://mcp.twilio.com/docs` indexes SendGrid's docs but can't call the API.
