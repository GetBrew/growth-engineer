---
name: TypeSafe AI
domain: typesafe.ai
category: ai-model
tagline: Jev, a decision model that answers typed questions about text with calibrated probabilities instead of writing text.
docs: https://docs.typesafe.ai
github: https://github.com/typesafe-ai
logo: https://cdn.growth.engineer/icons/companies/typesafe-640ee119.png
api:
  url: https://api.typesafe.ai
  auth: api_key
  env: TYPESAFE_API_KEY
  keyUrl: https://console.typesafe.ai
  docs: https://docs.typesafe.ai/api
  notes: "Put every question about one record in one request. `GET /v1/models` lists the models and is the cheapest check of a key; a request over the rate limit gets a 429 with a Retry-After header."
updated: 2026-09-29
---

TypeSafe AI builds System One models: models that make fast, structured
decisions inside software instead of generating text. Its first, Jev
(`jev-latest`, released on September 15, 2026), takes a state, any text or
JSON, and a set of named questions of three types: a choice picks one of the
labels you define, a score rates the state against an ordered rubric, and a
noul gives the probability that the answer is yes. It answers every question
in one pass, with the probabilities behind each answer and a confidence for
each choice and score, so software can act on the sure answers and send the
unsure ones to a person.

Every decision is one call, `POST /v1/systemone`, with the key as a Bearer
token. It is not a chat API: the body is the state, the model and the
questions, and there is no prompt or temperature. Requests are billed by
input tokens, and output tokens are free for now. The official SDKs are
`typesafe-sdk` for Python and `@typesafe-ai/sdk` for JavaScript.
