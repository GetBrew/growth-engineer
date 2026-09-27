---
name: Create a file request
summary: Creates a file request for a destination folder and returns the URL others use to upload files into it.
capability: store-files
docs: https://docs.dropboxapi.com/dropbox-api/api-reference/user-endpoints/file-requests/create
api: POST /2/file_requests/create
updated: 2026-09-26
---

Give it a `title` and a `destination` folder. Deadlines can only be set by Professional and Business accounts. Requires the `file_requests.write` scope.
