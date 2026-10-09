---
name: Get a dataset's download link
summary: Returns a one-hour download URL for one of the workspace's files, such as the 10M US dataset (9.5M people and 1.75M companies, two Parquet files in a zip).
notes: Take the file_id from GET /files/ (list_files on MCP). The 10M US dataset is open to everyone; a file not unlocked for the workspace answers 403. Free.
capability: find-prospects
docs: https://docs.datacircle.dev/files
mcp: get_download_link
api: POST /files/{file_id}/download-link/
updated: 2026-10-10
---
