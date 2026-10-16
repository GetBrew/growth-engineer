---
name: Enrich a company
summary: Returns company data for one domain or name, using the first provider looot can run.
notes: "Set `endpointId` to `job:company.enrich` and `input` to domain or name, plus an `idempotencyKey`. About $0.0019 per call at the cheapest provider."
capability: enrich-companies
docs: https://docs.looot.ai/mcp-tools/run
mcp: run
api: POST /v1/runs
updated: 2026-10-16
---
