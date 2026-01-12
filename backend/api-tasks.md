Auth (optional for later)

POST /api/v1/auth/register — create user

POST /api/v1/auth/login — login (JWT later)

GET /api/v1/auth/me — current user profile

Sample
=============================================================
1). POST /api/v1/sample — create sample
2). GET /api/v1/sample — list sample (pagination + search)
3). query: q, page, size, sort
4). GET /api/v1/sample/{id} — sample detail
5). PUT /api/v1/sample/{id} — update category (full update)
6). PATCH /api/v1/sample/{id} — partial update (optional)
7). DELETE /api/v1/sample/{id} — delete category (soft delete optional)

Master Code
=============================================================
1). POST /api/master-codes — create master code (root or child)
2). GET /api/master-codes — list master codes (pagination + search)
3). query: q, page, size, sort
    optional filters: parentId, rootOnly=true
4). GET /api/master-codes/{id} — master code detail
5). PUT /api/master-codes/{id} — update master code (full update)
    ✔ code, codeName
    ✖ parentId not allowed
6). PATCH /api/master-codes/{id} — partial update (optional)
    ✔ any of: code, codeName
7). DELETE /api/master-codes/{id} — delete master code (soft delete optional)
    rule: block delete if children exist (recommended)
Recommended extra retrieve-only endpoints
8). GET /api/master-codes/roots — list root-level master codes
    (pagination + search)
    query: q, page, size, sort
9). GET /api/master-codes/{id}/children — list direct children of a master code
    (pagination + search)
    query: q, page, size, sort
10). GET /api/master-codes/tree — retrieve master code hierarchy
    query: rootId (optional), depth (optional)
    note: read-only tree, no re-parenting