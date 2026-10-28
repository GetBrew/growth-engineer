---
title: Pull needs, objections and buying signals from sales calls
summary: Reads recent sales calls in Bridge, pulls out needs, objections, competitors and buying signals, and posts hot deals to Slack.
author: Shahzaib0217
motion: outbound
tags:
  - channel:chat
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- A table of the sales calls since the last run: account, needs, objections, competitors named, buying signals, next step and a deal temperature.
- A Slack post for each call at or above your temperature, with the evidence in the buyer's own words.

## Inputs

- `since`: when the last run happened, e.g. 2026-10-16
- `sales_terms`: words that mark a sales call in its title or transcript, e.g. demo, discovery, pricing, proposal
- `hot_level`: the lowest temperature to alert on, from cold, warm and hot, e.g. warm
- `sales_channel`: the Slack channel for deal alerts, e.g. #deals

## Steps

1. **List the calls** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Browse meetings from `since` to now. Keep each `recapId`, title, date and participants.
2. **Read each call** with [bridge/get-meeting-details](../companies/bridge/tools/get-meeting-details.md). Keep the calls that match `sales_terms` and have someone from outside your company, with their summary, takeaways and transcript. Skip meetings with no transcript.
3. **Pull the signals**. For each call, note the needs, objections, competitors named, buying signals (budget, timeline, decision maker, a pilot or contract asked for) and the agreed next step, each with a short quote. Rate the deal cold, warm or hot and say why in one line.
4. **Check with the user**. Show the table and let the user correct any rating before anything is posted. Keep the calls at `hot_level` or above.
5. **Alert the team** with [slack/post-message](../companies/slack/tools/post-message.md). Post each kept call to `sales_channel` with the account, temperature, top need, top objection, next step and the quotes.

## Notes

Look first at hot calls with no agreed next step. Run it weekly with `since` set to the previous run; for one call, ask for that meeting by name.
