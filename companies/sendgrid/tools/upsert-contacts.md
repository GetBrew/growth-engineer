---
name: Add or update contacts
summary: Queues up to 30,000 contacts, or 6 MB, to be created or updated in Marketing Campaigns and returns a job ID.
capability: build-audience
docs: https://www.twilio.com/docs/sendgrid/api-reference/contacts/add-or-update-a-contact
api: PUT /v3/marketing/contacts
updated: 2026-09-27
---

Processing is asynchronous: a `202` means queued, and the `job_id` shows the
import status. To update a contact, send all of its existing identifiers;
fields you leave out keep their values. Create custom fields before you set
them.
