---
name: Find free time
summary: Returns open meeting slots in a date range from the user's calendar, or the bookable slots of one booking page.
notes: "Range is at most 31 days; returns 20 slots unless `maxResults` (up to 100) is set. Without `page`, slots fall Mon to Fri 9:00 to 17:00 unless `workingHours` is passed. With `page`, returns the slots `book_meeting` accepts; an inactive page has none."
capability: book-meetings
docs: https://docs.meetonbridge.com/integrations/bridge-mcp
mcp: find_free_time
updated: 2026-10-27
---
