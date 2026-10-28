---
title: Log sales meetings and next steps in the CRM
summary: Reads sales meetings since the last run in Bridge, updates each buyer in HubSpot, and logs a note with needs, next steps and owners.
author: Shahzaib0217
motion: outbound
added: 2026-10-28
updated: 2026-10-28
---

## Outcome

- Every external attendee of a sales meeting since the last run, created or updated in HubSpot.
- A HubSpot note on each contact with the meeting date, needs, objections, next step and its owner.
- The list of meetings logged, and the attendees that were skipped and why.

## Inputs

- `since`: when the last run happened, e.g. 2026-10-16
- `own_domain`: your company's email domain, so your own people are not logged, e.g. acme.com
- `sales_terms`: words that mark a sales meeting in its title or transcript, e.g. demo, discovery, pricing

## Steps

1. **List the meetings** with [bridge/search-meetings](../companies/bridge/tools/search-meetings.md). Browse meetings from `since` to now. Keep each `recapId`, title, date and participants.
2. **Read each meeting** with [bridge/get-meeting-details](../companies/bridge/tools/get-meeting-details.md). Keep the meetings that match `sales_terms`, with their summary, action items and the participants outside `own_domain`, with names, titles and emails. Skip meetings with no transcript.
3. **Write the CRM update**. For each meeting, draft a note: date, attendees, needs, objections, the next step, who owns it and when it is due. Show the notes to the user.
4. **Find the records** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Search contacts by each attendee's email. Keep the matches and their IDs.
5. **Update the contacts** with [hubspot/upsert-contacts](../companies/hubspot/tools/upsert-contacts.md). Create or update each attendee, matched on email, with name, title and company. Keep each contact ID.
6. **Log the meeting** with [hubspot/create-note](../companies/hubspot/tools/create-note.md). Attach each approved note to its attendees' contact IDs, timestamped at the meeting start.

## Notes

Built on HubSpot. For Salesforce, use `salesforce/search-records`, `salesforce/update-record` and `salesforce/create-record`; for Attio, `attio/upsert-record` and `attio/create-note`.

Run it daily with `since` set to the previous run.
