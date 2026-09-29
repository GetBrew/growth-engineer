---
title: Sort contacts into buyer personas from their job titles
summary: Finds HubSpot contacts with no persona, maps each job title to a persona and seniority with Jev, and adds them to a list per persona.
author: thedogwiththedataonit
motion: outbound
updated: 2026-09-29
---

## Outcome

- A table of every contact checked, with its job title, persona, seniority and Jev's confidence.
- Each contact's persona saved on its HubSpot record, with the unsure ones decided by you.
- Each contact added to the HubSpot list for its persona, ready for that persona's sequence.

## Inputs

- `personas`: your buyer personas, each with one line on who belongs, e.g. economic_buyer: owns the budget; champion: runs the work every day; technical_evaluator: vets security and integrations; end_user: uses the product; not_a_buyer: students, recruiters and unrelated roles
- `persona_property`: the HubSpot contact property that holds the persona, created once as a dropdown with the persona names, e.g. buyer_persona
- `persona_lists`: the static HubSpot list for each persona, e.g. Persona: Economic buyer
- `max_contacts`: the most contacts to sort in one run, e.g. 500
- `min_confidence`: the confidence below which you pick the persona yourself, e.g. 0.8

## Steps

1. **Find unsorted contacts** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts that have a `jobtitle` and no `persona_property`, up to `max_contacts`. Keep each contact's ID, email, job title and company.
2. **Map each title** with [typesafe/answer-typed-questions](../companies/typesafe/tools/answer-typed-questions.md). Send each job title and company as the state, with a choice `persona` over `personas`, each label described by its line, and a score `seniority` on five levels (individual contributor, manager, director, vice president or head of, C-level or founder). Keep each contact's persona, seniority and confidences.
3. **Settle the unsure ones**. Show the user every contact whose persona confidence is below `min_confidence`, with Jev's two most likely personas, and keep the one the user picks.
4. **Save the persona** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). After the user approves, update each contact by email with its persona in `persona_property`.
5. **Add them to lists** with [hubspot/add-to-segment](../companies/hubspot/tools/add-to-segment.md). Add each contact ID to the list in `persona_lists` for its persona, leaving not_a_buyer contacts out.

## Notes

Titles like "Growth Ninja", "GM, Americas" or "Head of People & Revenue Ops" defeat keyword rules; the one-line description of each persona is what Jev decides against, so write them in your own words. Use seniority's most likely level. A title that sits between two levels shows it in the probabilities, so check those before you build a list on seniority alone.

Run it weekly, or after every list import, so new contacts land in the right sequence.
