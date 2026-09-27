---
name: Enrich a company
summary: Returns one company's industry, revenue, employee count, funding rounds, locations and parent or subsidiary companies, found by its domain or name.
capability: research-accounts
docs: https://docs.apollo.io/reference/organization-enrichment
mcp: apollo_organizations_enrich
cli: apollo companies enrich
api: GET /organizations/enrich
updated: 2026-09-26
---

Costs 1 credit per company. To enrich up to 10 companies in one call, use
bulk organization enrichment (`apollo_organizations_bulk_enrich` on the MCP
server, `apollo companies bulk-enrich` on the CLI).
