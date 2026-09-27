---
name: Generate a design
summary: Generates design candidates from a natural-language brief and returns each candidate's id, preview link and thumbnails.
capability: design-assets
docs: https://www.canva.dev/docs/apps/mcp/tools/generate-design/
mcp: generate-design
aliases:
  - canva/design-assets
updated: 2026-09-26
---

Show the candidates to the user rather than picking one, then call
`create-design-from-candidate` with the chosen `candidate_id` and the job id
to turn it into an editable design with an edit link.
