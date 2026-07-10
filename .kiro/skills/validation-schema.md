# Skill: validation-schema

## Purpose
Define where and how input validation happens so agents never invent ad-hoc if-checks inside services or controllers.

## Library
Use **Zod** for all validation. Do not use Joi, express-validator, or manual checks.

## Pattern: schema lives next to the DTO
For every endpoint with a body or query params, create a Zod schema in the same file as the DTO or in a co-located `*.schema.ts` file:

```ts
// comments/comment.schema.ts
import { z } from 'zod';

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Max 1000 characters'),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
```

## Validation middleware
Use a reusable `validate` middleware that takes a Zod schema and validates `req.body`:
```ts
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.flatten().fieldErrors);
    }
    req.body = result.data;
    next();
  };
```

Apply it on the route:
```ts
router.post(
  '/posts/:id/comments',
  requireAuth,
  validate(CreateCommentSchema),
  asyncHandler(CommentController.create)
);
```

## Where validation lives
| Layer | Responsibility |
|-------|---------------|
| Route middleware | Shape + type validation (Zod) |
| Service | Business rule validation (e.g. post exists, user not banned) |
| Repository | Nothing — trust the service |

## Agent rules
- NEVER validate inside a service or controller function body
- ALWAYS define the Zod schema before writing the route
- ALWAYS use `z.infer<typeof Schema>` as the DTO type — never write a separate interface
- ALWAYS throw `ValidationError` from the `validate` middleware, not a raw 400 response
- For path params (`:id`), validate with `z.coerce.number().int().positive()` in a `paramsSchema`