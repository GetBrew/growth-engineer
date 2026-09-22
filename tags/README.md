# tags/

The managed vocabulary, one file per tag at `tags/<namespace>/<slug>.md`.
The path is the key: `tags/motion/outbound.md` is `motion:outbound`.

| Namespace | Answers | Used by |
| --- | --- | --- |
| `capability` | what does it do? | tool slugs (a tool IS one capability), workflow tags |
| `motion` | which motion? (outbound, inbound, plg, abm…) | workflows |
| `channel` | which channel? (email, linkedin, phone…) | workflows |
| `category` | what kind of company? (crm, data-provider…) | `company.md` `category` |
| `fit` | who is it for? (b2b-saas, smb, enterprise…) | workflows |

Two more namespaces exist on the site but are **computed, never written as
files**: `agent:<level>` (a tool's readiness) and `has:<type>` (its ways in),
both derived from each tool's access.

## The file

```markdown
---
label: Enrich contacts
synonyms: [enrich, enrichment, data enrichment, contact data]
---

Adds firmographic and person data to a contact or account.
```

- `label` is what the site shows. `synonyms` feed search: typing
  "enrichment" finds every tool that enriches.
- The body is the description and is required — one sentence.
- Slugs are lowercase letters, digits and hyphens.

## Adding a capability

A new tool whose function has no matching slug adds
`tags/capability/<slug>.md` in the same pull request, then names its file
`companies/<handle>/tools/<slug>.md`. Reuse an existing capability whenever
it fits: the vocabulary is what makes "enrich contacts" from three vendors
comparable.
