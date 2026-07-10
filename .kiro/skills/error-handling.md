# Skill: error-handling

## Purpose
Define a consistent error handling pattern across all backend endpoints so agents never invent ad-hoc error shapes.

## Error response shape
All errors must return JSON in this envelope:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Comment with id 42 was not found.",
    "details": {}
  }
}
```
- `code` — machine-readable SCREAMING_SNAKE_CASE string
- `message` — human-readable sentence, safe to surface to the client
- `details` — optional extra context (validation field errors, etc.)

## HTTP status codes
| Situation | Status |
|-----------|--------|
| Successful creation | 201 |
| Successful read/update | 200 |
| Successful delete | 204 (no body) |
| Validation failure | 400 |
| Unauthenticated | 401 |
| Forbidden (authenticated but not allowed) | 403 |
| Resource not found | 404 |
| Conflict (duplicate, etc.) | 409 |
| Unexpected server error | 500 |

## Where to catch errors
- **Service layer** — throw typed application errors (e.g. `NotFoundError`, `ForbiddenError`)
- **Controller layer** — never catch manually; delegate to global error middleware
- **Global error middleware** — single `errorHandler(err, req, res, next)` function that maps error types to HTTP responses

## Typed error classes
Always define and throw from a central `errors/` directory:
```ts
export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super('RESOURCE_NOT_FOUND', `${resource} with id ${id} was not found.`, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('FORBIDDEN', 'You do not have permission to perform this action.', 403);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Input validation failed.', 400, details);
  }
}
```

## Async handler wrapper
Wrap all async controller functions to avoid unhandled promise rejections:
```ts
export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

## Agent rules
- NEVER use `try/catch` in controllers — use `asyncHandler` and let middleware handle it
- NEVER return raw error strings — always use the error envelope
- ALWAYS throw a typed error from the service, not the controller
- ALWAYS add new error types to the central `errors/` directory