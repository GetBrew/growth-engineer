---
name: Clay
domain: clay.com
category: data-provider
tagline: Go-to-market data platform for finding, enriching and watching people and companies.
docs: https://developers.clay.com
github: https://github.com/clay-run
logo: clay.png
cli:
  install: npm install --global @clay-run/cli
  binary: clay
  auth: oauth
  docs: https://developers.clay.com/concepts/cli-basics
api:
  url: https://api.clay.com/public/v0
  auth: api_key
  env: CLAY_PUBLIC_API_KEY
  header: clay-api-key
  keyUrl: https://app.clay.com/workspaces/~/settings/account?accountTab=api-keys-beta
  docs: https://developers.clay.com/public-api/authentication
updated: 2026-09-26
---

Clay is a go-to-market data and automation platform. From the `clay` CLI or
the Public API an agent can search Clay's database of people and companies,
run Clay-managed enrichment functions (work email, phone, firmographics, tech
stack, funding) or a team's own functions, and set up signals that watch for
job changes, hiring and funding news. Tables and custom functions are still
built in the Clay app; the CLI and API run and read them.
