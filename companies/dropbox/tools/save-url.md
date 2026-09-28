---
name: Save a file from a URL
summary: Downloads the file at a URL into a path in the user's Dropbox, as a job that must finish within 15 minutes.
notes: "Returns an `async_job_id`: check it with `POST /2/files/save_url/check_job_status` until the file is saved. Needs the `files.content.write` scope."
capability: store-files
docs: https://docs.dropboxapi.com/dropbox-api/api-reference/user-endpoints/files/save-url
api: POST /2/files/save_url
aliases:
  - dropbox/store-files
updated: 2026-09-26
---
