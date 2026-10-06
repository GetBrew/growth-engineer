---
name: Bouncer
domain: usebouncer.com
category: data-provider
tagline: Verify email addresses one at a time or in lists of up to 100,000 before you send.
docs: https://docs.usebouncer.com
mcp:
  url: https://api.usebouncer.com/mcp
  auth: oauth
  docs: https://www.usebouncer.com/email-verification-mcp-server/
api:
  url: https://api.usebouncer.com
  auth: api_key
  env: BOUNCER_API_KEY
  header: x-api-key
  keyUrl: https://app.usebouncer.com
  docs: https://docs.usebouncer.com/quick-start
  notes: Create the key in the app's API section. Batch jobs run one after another per account, so a 100,000-address batch delays the next one.
updated: 2026-10-06
---

Bouncer verifies email addresses and says whether each one is safe to send
to. Every result has a status (deliverable, risky, undeliverable or unknown),
a reason such as `rejected_email` or `low_deliverability`, a 0–100 score, a
toxicity rating, and flags for catch-all domains, disposable and free
providers, role accounts and full mailboxes. It verifies in real time, in a
synchronous batch of up to 10,000 addresses, or in an asynchronous batch of
up to 100,000, and also checks domains and the toxicity of a list.

The hosted MCP server signs in with OAuth and uses the same credits as the
app and the API. One credit verifies one address; Bouncer does not charge for
duplicates within a list or for unknown results, and credits do not expire.
