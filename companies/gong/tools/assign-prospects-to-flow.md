---
name: Add prospects to an Engage flow
summary: Assigns up to 100 CRM contacts or leads to a Gong Engage flow, starting its email and call to-dos for them.
capability: send-email
docs: https://help.gong.io/apidocs/assign-prospects-contacts-or-leads-to-an-engage-flow-v2flowsprospectsassign-1
api: POST /v2/flows/prospects/assign
updated: 2026-09-27
---

Pass the prospects' CRM IDs in `crmProspectsIds`, the `flowId` (list flows
with `GET /v2/flows`), and `flowInstanceOwnerEmail`, the Gong user who owns
the flow's to-dos. `overrides` can replace a step's subject, body or
placeholder values for this assignment. Needs Gong Engage, and OAuth apps
need the `api:flows:write` scope. Assigning starts real outreach: confirm the
flow and the prospects first.
