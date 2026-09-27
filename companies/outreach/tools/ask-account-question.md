---
name: Ask a question about an account
summary: Answers a plain-language question about one Outreach account from its records, call transcripts and related data, and saves the question and answer in Outreach.
capability: research-accounts
docs: https://developers.outreach.io/mcp-server/tool-catalog
mcp: account_answer_question
updated: 2026-09-27
---

Find the account with `account_search` first. Each question is saved to the
account's Q&A history in the Outreach app, which is why the tool is not marked
read-only. `opportunity_answer_question` does the same for an opportunity.
