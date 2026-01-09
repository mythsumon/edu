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