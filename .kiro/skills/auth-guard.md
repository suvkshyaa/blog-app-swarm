# Skill: auth-guard

## Purpose
Define how authentication and authorization are applied to endpoints so agents apply guards consistently — never invent inline auth logic.

## Authentication (who are you?)
- All protected routes use a `requireAuth` middleware that validates the JWT/session and attaches the user to `req.user`
- `req.user` shape:
  ```ts
  interface AuthUser {
    id: number;
    email: string;
    role: 'user' | 'admin';
  }
  ```
- If the token is missing or invalid → throw `UnauthorizedError` (401)
- Never decode or verify tokens inside a controller or service — only in middleware

## Authorization (are you allowed?)
Three patterns — pick the right one per endpoint:

### 1. Authenticated only
```ts
router.get('/posts', requireAuth, asyncHandler(PostController.list));
```

### 2. Owner only (user can only act on their own resource)
```ts
// In the service, after fetching the resource:
if (comment.authorId !== currentUser.id) {
  throw new ForbiddenError();
}
```

### 3. Admin or owner
```ts
if (currentUser.role !== 'admin' && comment.authorId !== currentUser.id) {
  throw new ForbiddenError();
}
```

## Middleware stack order
```
requireAuth → validate input → controller → service (owner check here) → repository
```

## Public vs protected endpoints
| Endpoint | Auth required | Owner check |
|----------|--------------|-------------|
| GET /posts | No | — |
| GET /posts/:id | No | — |
| POST /posts | Yes | — |
| GET /posts/:id/comments | No | — |
| POST /posts/:id/comments | Yes | — |
| DELETE /comments/:id | Yes | Yes (author or admin) |

## Agent rules
- NEVER put JWT decode logic in a controller or service
- ALWAYS use `requireAuth` middleware on the route definition, not inside the handler
- ALWAYS do owner/role checks in the **service**, not the controller
- NEVER expose internal user fields (password hash, tokens) on `req.user`
- When adding a new endpoint, explicitly decide: public / auth-only / owner-only / admin-only