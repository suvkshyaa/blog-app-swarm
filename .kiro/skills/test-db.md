# Skill: test-conventions

## Purpose
Define the test framework, file structure, mock strategy, and naming rules so all generated tests are consistent and runnable.

## Framework
- **Unit + integration tests**: Vitest
- **Component tests**: Vitest + React Testing Library
- **E2E / controller tests**: Supertest against the Express app

## File location
Co-locate test files next to the source file they test:
```
src/
  comments/
    comment.service.ts
    comment.service.test.ts      ← unit test
    comment.repository.ts
    comment.repository.test.ts   ← integration test (uses test DB)
  controllers/
    comment.controller.ts
    comment.controller.test.ts   ← supertest E2E
  components/
    comments/
      CommentForm.tsx
      CommentForm.test.tsx        ← RTL component test
```

## Naming convention
```ts
describe('CommentService', () => {
  describe('create', () => {
    it('creates a comment and returns it', async () => { ... });
    it('throws NotFoundError when post does not exist', async () => { ... });
    it('throws ForbiddenError when user is banned', async () => { ... });
  });
});
```
Rule: `describe` = class/module name → `describe` = method name → `it` = behaviour in plain English.

## Mock strategy
- **Unit tests** (service): mock the repository with `vi.fn()`
- **Integration tests** (repository): use a real test DB (see `test-db-setup` skill)
- **Controller tests**: mock the service, use supertest for HTTP layer

```ts
// Mocking a repository in a service unit test
const mockCommentRepo = {
  create: vi.fn(),
  findByPostId: vi.fn(),
  findById: vi.fn(),
  delete: vi.fn(),
};

const service = new CommentService(mockCommentRepo);
```

## Test structure (AAA)
Every test follows Arrange → Act → Assert:
```ts
it('returns 404 when comment does not exist', async () => {
  // Arrange
  mockCommentRepo.findById.mockResolvedValue(null);

  // Act & Assert
  await expect(service.delete(999, mockUser)).rejects.toThrow(NotFoundError);
});
```

## Common assertions
```ts
// HTTP status
expect(res.status).toBe(201);

// Response shape
expect(res.body).toMatchObject({ id: expect.any(Number), content: 'hello' });

// Error shape
expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');

// Mock was called
expect(mockCommentRepo.create).toHaveBeenCalledWith(expect.objectContaining({ postId: 1 }));
```

## Agent rules
- ALWAYS co-locate test files next to source files
- ALWAYS follow the `describe → describe → it` nesting structure
- NEVER use `test()` at the top level — always wrap in `describe`
- NEVER mock the repository in integration tests — use the real test DB
- ALWAYS clean up mocks between tests: `beforeEach(() => vi.clearAllMocks())`
- NEVER import the real DB connection in unit tests