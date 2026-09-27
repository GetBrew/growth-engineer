---
name: Add a person to a cadence
summary: Adds one person to a Salesloft cadence and returns the cadence membership, whose state shows whether the cadence has started for them.
capability: send-email
docs: https://developers.salesloft.com/docs/api/cadence-memberships-create/
api: POST /v2/cadence_memberships
updated: 2026-09-27
---

Pass `person_id` and `cadence_id` as query parameters; `user_id` defaults to
you, and `step_id` starts the person on a later step. You can add a person on
a teammate's behalf only to a team cadence, a cadence the teammate owns, or
when the teammate has the Personal Cadence Admin permission. The call needs
the `cadences:write` scope. In the response, `current_state` `staged` means
the person is waiting for the cadence's first step. Adding someone to a
cadence can start real outreach, so confirm the cadence first.
