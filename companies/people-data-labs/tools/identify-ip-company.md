---
name: Identify the company behind an IP address
summary: Returns the company associated with an IP address, with a confidence level, name, website, size and industry, and on request the IP's location and whether it is a VPN, proxy, mobile or hosting address.
capability: track-intent
docs: https://docs.peopledatalabs.com/docs/reference-ip-enrichment-api
api: GET /v5/ip/enrich
updated: 2026-09-27
---

Run it on website visitors' IP addresses to see which companies are visiting.
Charged per match. Set `min_confidence` (such as `high`) to drop weak matches,
and `return_ip_location` or `return_ip_metadata` to include the IP's location
or network flags, which are left out by default.
