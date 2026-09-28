---
title: How Brew books 20 demos per week with outbound
summary: Run cold email and LinkedIn as one system, build each prospect's email before they ask for it, and steer every warm reply to one of three outcomes.
author: philsoerensen
tags:
  - motion:outbound
  - channel:email
  - channel:linkedin
updated: 2026-09-28
---

## Inputs

- `ideal_customer`: the companies and roles to target, e.g. B2B software, 20 to 500 employees, the person who owns marketing or growth
- `weekly_volume`: new prospects to contact each week, e.g. 2,000
- `email_campaign_id`: the Instantly campaign that sends the cold emails
- `linkedin_campaign_id`: the HeyReach campaign that sends the connection requests and messages
- `booking_link`: the calendar link a warm reply gets

## Steps

1. **Build the week's list** with [crustdata/search-people](../companies/crustdata/tools/search-people.md). Find up to `weekly_volume` people matching `ideal_customer`, one per company. Keep each person's name, title, company, company domain and LinkedIn profile URL.
2. **Get their work emails** with [crustdata/enrich-person-contact](../companies/crustdata/tools/enrich-person-contact.md). Look up business emails by LinkedIn profile URL, in batches. Keep each person's work email; people with no email stay in the list for the LinkedIn channel.
3. **Verify the emails** with [instantly/verify-email](../companies/instantly/tools/verify-email.md). Check each work email and keep only the verified ones for the email channel. Bounces burn the sending domains that everything else depends on.
4. **Build their email before they ask** with [brew/generate-email](../companies/brew/tools/generate-email.md). For the best-fit prospects, point Brew at the prospect's own site so it picks up their brand, and generate the first email their company should be sending but is not, such as their welcome email. Keep each email's preview link. This is the step that makes the reply rate: the first message can show finished work instead of describing it.
5. **Enroll the email channel** with [instantly/add-leads-to-campaign](../companies/instantly/tools/add-leads-to-campaign.md). Add the verified people to `email_campaign_id`. The copy leads with what is wrong or missing in the prospect's current emails and offers the finished version from the previous step, not a pitch about the product.
6. **Enroll the LinkedIn channel** with [heyreach/add-leads-to-campaign](../companies/heyreach/tools/add-leads-to-campaign.md). Add the rest to `linkedin_campaign_id`, which spreads sends across several LinkedIn sender accounts so no single profile exceeds its daily limits. Keep the two channels' lists apart so nobody is cold-contacted twice in the same week.
7. **Sweep the LinkedIn inbox** with [heyreach/get-conversations](../companies/heyreach/tools/get-conversations.md). At least daily, pull recent conversations and judge each one by its newest message, not by thread-level metadata. Sort replies into warm, question, not-now and no.
8. **Reply on LinkedIn** with [heyreach/send-message](../companies/heyreach/tools/send-message.md). Answer the actual question first, in the sender's own voice, short and specific. Every warm reply steers to exactly one of three outcomes: try the product self-serve, book a call at `booking_link`, or take the done-for-you offer. Show the user each reply before it sends.
9. **Reply on email** with [instantly/reply-to-email](../companies/instantly/tools/reply-to-email.md). Same playbook as LinkedIn, and when a prospect bites on the offer, the reply carries the preview link built in step 4. A not-now gets a date to reconnect, not a push.
10. **Suppress every no, on both channels**. Keep one suppression list. A no, an unsubscribe or a wrong-person reply on either channel stops the sequence and blocks the person on the other channel too, since the campaigns do not share their no's on their own.

## Done when

- Every reply from either channel has an answer, or a note saying why it was skipped, by the end of the day it arrived.
- Every no is suppressed on both channels, not only the one it came from.
- The user has a weekly table of contacted, replies, warm replies and demos booked, tracked against the weekly demo target.

## Notes

Three outcomes, never zero and never four: a warm reply that is not steered anywhere is a compliment, not a demo, and a reply that pitches all three options at once reads like a script. Pick the one that fits what the person actually said.

The channels behave differently. Email carries the built-artifact offer well because a preview link renders in the thread; LinkedIn works best two or three sentences at a time, casual, answering questions honestly, including questions about price. If the honest answer is that the product does not do something, say so and suggest what does; the goodwill outlasts the thread.

The weekly numbers only mean something if the sweep runs every day. Replies decay fast: a warm reply answered the same day books; the same reply answered on Thursday usually does not.
