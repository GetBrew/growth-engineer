---
name: Update a card
summary: Changes a card's fields, such as its list, due date, members or archived state, and returns the updated card.
capability: manage-tasks
docs: https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-put
api: PUT /cards/{id}
updated: 2026-09-26
---

Set `idList` to move the card to another list, `due` to change its due date, and `closed` to archive it. Parameters can go in the query string or a JSON body.
