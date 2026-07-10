# Skill: api-client

## Purpose
Define the frontend API call pattern so agents never generate inconsistent fetch calls, missing auth headers, or unhandled 401s.

## Base client
All API calls go through a single `apiClient` instance in `src/lib/api.ts`:

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error?.code, body?.error?.message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
```

## ApiError class
```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}
```

## Per-resource API modules
Each resource gets its own file in `src/api/`:
```ts
// src/api/comments.ts
import { apiClient } from '@/lib/api';
import type { Comment } from '@/types/comment';

export const commentsApi = {
  list: (postId: number) =>
    apiClient.get<Comment[]>(`/posts/${postId}/comments`),
  create: (postId: number, content: string) =>
    apiClient.post<Comment>(`/posts/${postId}/comments`, { content }),
  remove: (commentId: number) =>
    apiClient.delete<void>(`/comments/${commentId}`),
};
```

## Agent rules
- NEVER call `fetch` directly in a component — always use `apiClient`
- NEVER hardcode the base URL — use `import.meta.env.VITE_API_URL`
- NEVER attach auth headers manually in a component — the base client handles it
- ALWAYS create a resource-specific API module in `src/api/` for new endpoints
- ALWAYS handle loading and error states in the component using the `ApiError` type