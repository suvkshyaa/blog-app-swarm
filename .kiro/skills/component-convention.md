# Skill: component-conventions

## Purpose
Set consistent structure rules for all React components so agents never mix naming styles, CSS approaches, or export patterns.

## File naming
- Component files: `PascalCase.tsx` (e.g. `CommentForm.tsx`, `CommentList.tsx`)
- Hook files: `use-kebab-case.ts` (e.g. `use-comments.ts`)
- API modules: `camelCase.ts` (e.g. `comments.ts`)
- All components live under `src/components/` organised by feature:
  ```
  src/
    components/
      comments/
        CommentForm.tsx
        CommentList.tsx
        CommentItem.tsx
      posts/
        PostCard.tsx
    api/
      comments.ts
      posts.ts
    hooks/
      use-comments.ts
  ```

## Component structure (order matters)
```tsx
// 1. Imports
import { useState } from 'react';
import { commentsApi } from '@/api/comments';
import type { Comment } from '@/types/comment';

// 2. Props interface (named, exported)
export interface CommentFormProps {
  postId: number;
  onSuccess?: (comment: Comment) => void;
}

// 3. Component (named function, default export at bottom)
function CommentForm({ postId, onSuccess }: CommentFormProps) {
  // 3a. State
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3b. Handlers
  async function handleSubmit() { ... }

  // 3c. Render
  return ( ... );
}

// 4. Default export (always at the bottom)
export default CommentForm;
```

## Styling
Use **Tailwind CSS** utility classes. No CSS modules, no styled-components, no inline `style` objects except for dynamic values that Tailwind cannot express.

## Loading and error states
Every component that makes an API call must handle three states explicitly:
```tsx
if (loading) return <div className="text-sm text-gray-400">Loading...</div>;
if (error) return <div className="text-sm text-red-500">{error}</div>;
```

## Custom hooks
Extract API call logic into a custom hook when a component does more than one fetch:
```ts
// src/hooks/use-comments.ts
export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    commentsApi.list(postId)
      .then(setComments)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [postId]);

  return { comments, loading, error, setComments };
}
```

## Agent rules
- ALWAYS use named function declarations for components, not arrow functions
- ALWAYS put the default export at the bottom of the file, never inline
- ALWAYS export the Props interface so it can be imported by tests and parent components
- NEVER use inline `style` objects for static styles — use Tailwind classes
- NEVER put API calls directly in a component — use a custom hook or the api module
- NEVER use `any` — define types in `src/types/` and import them