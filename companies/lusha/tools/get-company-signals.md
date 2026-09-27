---
name: Get a company's buying signals
summary: Returns recent signals for companies found by name or domain, such as headcount growth, hiring surges, website traffic changes and news like funding rounds or executive hires.
capability: track-intent
docs: https://docs.lusha.com/mcp-docs
mcp: signals_companies_search
updated: 2026-09-27
---

List the valid signal types first with `signals_company_filters`, which costs
no credits. Signals cover the last six months by default, and each signal
returned costs credits, so run it on a shortlist. For companies you already
have Lusha IDs for, use `signals_companies_get`.
