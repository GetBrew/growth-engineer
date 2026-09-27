---
name: Salesforce
domain: salesforce.com
category: crm
tagline: The system of record for enterprise sales teams.
docs: https://developer.salesforce.com/docs
logo: salesforce.png
mcp:
  url: https://api.salesforce.com/platform/mcp/v1/platform/sobject-mutations
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/sobject-mutations.html
cli:
  install: npm install @salesforce/cli --global
  binary: sf
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/salesforce-cli-reference/guide/cli_reference.html
api:
  url: https://MyDomainName.my.salesforce.com
  auth: oauth
  docs: https://developer.salesforce.com/docs/platform/api-rest/guide/intro-rest.html
updated: 2026-09-26
---

Salesforce is a cloud-based software company that provides a comprehensive customer relationship management platform.

The MCP server is Salesforce's hosted SObject Mutations server for production orgs: it queries, searches, creates and updates records but never deletes them. Sandboxes use `https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-mutations`, and an admin must first create an External Client App and activate the server. The REST API runs on each org's own My Domain URL, written `https://MyDomainName.my.salesforce.com` in Salesforce's docs, and its paths carry the API version as `vXX.X`; after `sf org login web`, `sf org display` prints both as Instance Url and Api Version.
