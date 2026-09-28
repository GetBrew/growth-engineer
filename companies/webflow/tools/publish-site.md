---
name: Publish a site
summary: Publishes a site's latest changes, or one page, to its Webflow subdomain or chosen custom domains.
notes: "Puts every pending change live, so confirm with the user first. The API needs `customDomains` (custom domain IDs) or `publishToWebflowSubdomain: true`."
capability: publish-content
docs: https://developers.webflow.com/data/reference/sites/publish
mcp: data_sites_tool
cli: webflow sites publish
api: POST /sites/{site_id}/publish
updated: 2026-09-27
---
