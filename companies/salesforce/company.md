---
name: Salesforce
domain: salesforce.com
category: crm
tagline: CRM for accounts, contacts, leads and opportunities.
docs: https://developer.salesforce.com/docs
logo: salesforce.png
mcp:
  url: https://api.salesforce.com/platform/mcp/v1/platform/sobject-mutations
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/sobject-mutations.html
  notes: An admin creates an External Client App and activates the server first. It never deletes records.
cli:
  install: npm install @salesforce/cli --global
  binary: sf
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference.html
  notes: Sign in with `sf org login web`; `sf org display` then prints the instance URL and API version.
api:
  url: https://{my_domain}.my.salesforce.com
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/api-rest/guide/intro-rest.html
  notes: "`{my_domain}` is your org's My Domain name, and paths carry the API version as `vXX.X`; `sf org display` prints both as Instance Url and Api Version."
updated: 2026-09-27
---

Salesforce is a CRM: accounts, contacts, leads and opportunities, as objects each org can extend.

The MCP server is Salesforce's hosted SObject Mutations server for production orgs: it queries, searches, creates and updates records but never deletes them. Sandboxes use `https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-mutations`, and an admin must first create an External Client App and activate the server. The REST API runs on each org's own My Domain URL, written `https://{my_domain}.my.salesforce.com` here (`MyDomainName` in Salesforce's docs), and its paths carry the API version as `vXX.X`; after `sf org login web`, `sf org display` prints both as Instance Url and Api Version.
