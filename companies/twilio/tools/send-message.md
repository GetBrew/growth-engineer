---
name: Send a message
summary: Sends an SMS, MMS or WhatsApp message from a Twilio sender to one recipient and returns the new Message resource.
notes: A body over 160 GSM-7 characters is split into segments, each charged, and trial accounts can only send to verified numbers.
capability: send-sms
docs: https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource
cli: twilio api:core:messages:create
updated: 2026-09-27
---
