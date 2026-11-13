---
title: Turn new content into segmented, tested email sequences
summary: Splits opted-in HubSpot contacts by one field, writes each segment an email from your asset, A/B tests it and follows up openers.
author: corynelson88
motion: content
tags:
  - channel:email
added: 2026-11-11
updated: 2026-11-11
---

## Outcome

- Your opted-in contacts split into segments, each contact in exactly one, with a count of those left out for a missing value.
- An approved email per segment for this touch, every stat and claim in it traced to your asset.
- This touch queued in Brew, with its send IDs and the date to run the next touch.
- From the second touch on, opens, clicks and bounces by segment and variant, the variant that led, and what the next touch carries forward.

## Inputs

- `sequence`: the touches in order, each with its asset and the email's job, e.g. 1: three stats from https://acme.example/report, no link; 2: drive to https://acme.example/blog/post; 3: link to the full report
- `touch`: which touch this run sends, e.g. 1
- `segment_property`: the HubSpot contact property that splits the audience, e.g. industry, persona, lifecycle stage or pain point
- `segments`: the values of `segment_property` to target, one email each, e.g. Cereal, Salty snacks, Canned goods
- `consent_property`: the HubSpot contact property that is true when someone opted in to marketing email, e.g. marketing_opt_in
- `test_element`: what the two touch-one variants differ on, e.g. subject line, or call to action
- `wait_days`: how long to wait after a touch before the next one, e.g. 4
- `previous_send_ids`: for touch 2 or later, the send IDs the last run returned, with the segment and variant of each
- `max_emails`: the most email designs to generate in one run, e.g. 8

## Steps

1. **Read the asset** with [firecrawl/scrape-url](../companies/firecrawl/tools/scrape-url.md). Fetch the asset `sequence` names for `touch` as markdown. Keep its URL, title, and every stat and claim the email may use, each with the sentence it came from.
2. **Check the last touch** with [brew/get-send](../companies/brew/tools/get-send.md). Skip on touch 1. Read each send in `previous_send_ids`; if any went out fewer than `wait_days` ago, stop and tell the user when to run again. Keep opens, clicks and bounces by segment and variant, and the variant that led in each segment.
3. **Pull the segments** with [hubspot/search-crm-records](../companies/hubspot/tools/search-crm-records.md). Touch 1 only. For each value in `segments`, search contacts whose `segment_property` equals it, with `consent_property` true and `hs_email_optout` not set. Count opted-in contacts with no value for `segment_property`; if they outnumber the segmented ones, stop and tell the user to clean the field first. Put any contact who matches twice in one segment only. Keep each segment's emails.
4. **Find who opened** with [brew/create-audience-from-events](../companies/brew/tools/create-audience-from-events.md). Touch 2 or later. For each send in `previous_send_ids`, build an audience of its recipients who opened it, leaving out bounces and unsubscribes, and wait until it has built. Keep each audience ID and size by segment.
5. **Plan the angles**. For each segment, write how this touch's asset matters to that segment, using only the facts kept in step 1, and the job `sequence` gives this touch. On touch 1, write two variants per segment that differ only in `test_element`; on later touches, write one that follows the variant that led in step 2. Show the plan to the user. Keep the approved angle and subject line for each segment and variant.
6. **Write the emails** with [brew/generate-email](../companies/brew/tools/generate-email.md). Generate one email per approved angle, no more than `max_emails` in all. Check every number and claim against step 1 and flag any that is not in the asset. Show the drafts to the user. Keep each approved email's `emailId`, `emailVersionId` and subject, with its segment and variant.
7. **Send** with [brew/send-email](../companies/brew/tools/send-email.md). Match the consent-qualified addresses to existing subscribed Brew contacts first; stop for the user to prepare any missing contacts. On touch 1, split each segment's contacts alternately into two halves and send each half one variant, 50 inline recipients per send; on later touches, send each segment's email to its audiences from step 4. Give each send its own idempotency key. Keep every sendId with its segment, variant and touch.
8. **Confirm the queue** with [brew/get-send](../companies/brew/tools/get-send.md). Read each sendId from step 7 until it is terminal or the execution window ends. Keep its status and delivery accounting; a queued send has not been delivered.
9. **Summarize the run**. Show a table of this touch's sends by segment and variant with their status, and, from step 2, the previous touch's results with the variant that led and what this touch carried forward. Give the sendIds to pass as `previous_send_ids` and the date, `wait_days` from today, to run the next touch.

## Notes

### Running the sequence

Run once per touch: touch 1 sends to every segment, and each later run goes only to people who opened the touch before it, so a sequence of three takes three runs. Touch 1 is the A/B test; later touches send to a saved audience, which the send call can't split, so they carry forward the variant that led instead of testing again. Run touch 1 whenever you publish an asset worth distributing, or monthly with your newsletter links as the asset.

### Before the first run

- Segments are only as good as `segment_property`. Fill it in across your CRM before you rely on it; step 3 stops when most contacts have no value.
- Contacts must already exist in Brew as subscribed contacts, for example synced from HubSpot. Step 7 stops when they don't.
- Read every draft before it sends. Step 6 flags any stat that is not in the asset, so copy stays inside what you published.

### Where this comes from

Adapted from how Harmonya's one-person marketing team replaced a single monthly newsletter to the whole list with segmented sequences, as described in [this article](https://thegtmengineer.substack.com/p/how-to-turn-email-marketing-into) (sponsored by Brew). The article reports that open and click rates more than doubled against the earlier newsletter, without a baseline or figures; treat that as a reported claim, not a benchmark for this workflow.
