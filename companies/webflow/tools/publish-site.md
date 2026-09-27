---
name: Publish a site
summary: Publishes a site's latest changes, or one page, to its Webflow subdomain or chosen custom domains.
capability: publish-content
docs: https://developers.webflow.com/data/reference/sites/publish
mcp: data_sites_tool
cli: webflow sites publish
api: POST /sites/{site_id}/publish
updated: 2026-09-27
---

On the MCP server, use the `publish_site` action of `data_sites_tool` with
`site_id`. The API needs `customDomains` (custom domain IDs) or
`publishToWebflowSubdomain: true`; the CLI publishes to the Webflow
subdomain unless you pass `--domains`, publishes one page with `--page`, and
previews with `--dry-run`. Publishing puts every pending change live, so
confirm with the user first.
