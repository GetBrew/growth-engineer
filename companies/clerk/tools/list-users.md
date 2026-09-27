---
name: List users
summary: Returns the application's users, newest first, filtered by email, name, organization or sign-up, sign-in and last-active dates.
capability: authenticate-users
docs: https://clerk.com/docs/reference/backend-api/tag/users/GET/users
cli: clerk users list
api: GET /users
aliases:
  - clerk/authenticate-users
updated: 2026-09-26
---

To walk many pages, paginate with `starting_after` rather than `offset`.
