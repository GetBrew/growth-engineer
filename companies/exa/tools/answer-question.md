---
name: Answer a question from the web
summary: Searches the web for a question and returns a direct answer or a summary with citations, or JSON that matches an output schema.
capability: research-accounts
docs: https://exa.ai/docs/reference/answer
api: POST /answer
updated: 2026-09-27
---

Specific questions get a direct answer and open-ended ones a detailed summary
with citations. Pass `outputSchema` for a structured answer, and use Exa
Agent for research that needs many searches.
