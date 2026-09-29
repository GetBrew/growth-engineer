---
name: Answer typed questions
summary: Answers named choice, score and yes-or-no questions about one text or JSON state with Jev in a single pass, each with its probabilities and a confidence.
notes: "Send `state`, `model` (`jev-latest`) and named `questions`, each with `type`, `instructions` and `criteria`: a choice maps labels to descriptions, a score lists its levels in order, a noul's is optional. Read a score by its most likely level; send unsure answers to a person."
capability: classify-signals
docs: https://docs.typesafe.ai/api
api: POST /v1/systemone
updated: 2026-09-29
---
