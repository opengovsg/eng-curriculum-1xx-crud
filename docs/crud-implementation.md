# CRUD Implementation Best Practices

This document outlines best practices for implementing CRUD (Create, Read, Update, Delete) operations in a modern Next.js application, using the Threads and Comments feature as a reference implementation.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Validation of Inputs](#validation-of-inputs)
3. [Form Handling](#form-handling)
4. [Query Cache Invalidation](#query-cache-invalidation)
5. [Error Handling](#error-handling)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [Database Layer Patterns](#database-layer-patterns)
8. [Type Safety](#type-safety)
9. [Pagination](#pagination)
10. [Authentication & Authorization](#authentication--authorization)

---

## Architecture Overview

This codebase follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Components    │  │     Forms       │  │   Queries   │  │
│  │ (thread-card)   │  │ (add-thread)    │  │ (useTRPC)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     tRPC Router Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  thread.ts      │  │  comment.ts     │  (routers)        │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ thread.service  │  │ comment.service │  (business logic) │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Prisma Client  │  │  Select Objects │  (@acme/db)       │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**Key directories:**

- `apps/web/src/validators/` - Zod validation schemas
- `apps/web/src/server/api/routers/` - tRPC router definitions
- `apps/web/src/server/modules/` - Service layer with business logic
- `apps/web/src/app/(authed)/` - Frontend components and pages

---

## Validation of Inputs

### Why Validation Matters

Input validation is your first line of defense against:

- **Security vulnerabilities** (SQL injection, XSS)
- **Data integrity issues** (malformed data in database)
- **Poor user experience** (confusing error messages)

### Schema Definition with Zod

Define validation schemas in a dedicated `validators/` directory. This allows **sharing schemas between frontend and backend**.

```typescript
// apps/web/src/validators/thread.ts
import z from 'zod'

export const createThreadInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' }) // User-friendly error
    .max(255, { message: 'Title must be at most 255 characters' }),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(5000, { message: 'Content must be at most 5000 characters' }),
})

export const getThreadByIdSchema = z.object({
  id: z.cuid(), // Validates format of CUID identifiers
})
```

### Best Practices for Validation Schemas

#### 1. Use Descriptive Error Messages

Always provide human-readable error messages that can be displayed directly to users:

```typescript
// ❌ Bad - uses default Zod error
z.string().min(1)

// ✅ Good - custom user-friendly message
z.string().min(1, { message: 'Title is required' })
```

#### 2. Reuse Schema Components

Avoid duplication by extracting and reusing schema parts:

```typescript
// apps/web/src/validators/comment.ts
import { getThreadByIdSchema } from './thread'

export const createCommentInputSchema = z.object({
  threadId: getThreadByIdSchema.shape.id, // Reuses the ID validation
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(5000, { message: 'Content must be at most 5000 characters' }),
})
```

#### 3. Use Type-Safe ID Validation

Use `z.cuid()` or similar validators to ensure IDs match your database's ID format:

```typescript
export const getThreadByIdSchema = z.object({
  id: z.cuid(), // Matches Prisma's @default(cuid())
})
```

#### 4. Extend Base Schemas for Related Operations

For operations that need pagination plus additional fields:

```typescript
// apps/web/src/validators/comment.ts
export const getCommentsByThreadIdSchema = offsetPaginationSchema.extend({
  threadId: getThreadByIdSchema.shape.id,
})
```

### Backend Validation with tRPC

tRPC automatically validates inputs using your Zod schemas and returns type-safe errors:

```typescript
// apps/web/src/server/api/routers/thread.ts
export const threadRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createThreadInputSchema) // ← Validation happens here
    .mutation(async ({ input, ctx }) => {
      // `input` is now fully typed and validated
      const thread = await createThread({
        authorId: ctx.session.userId,
        title: input.title,
        content: input.content,
      })
      return thread
    }),
})
```

### Zod Error Formatting

tRPC is configured to flatten Zod errors for easier frontend consumption:

```typescript
// apps/web/src/server/api/trpc.ts
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    }
  },
})
```

---

## Form Handling

### Why React Hook Form?

This codebase uses **React Hook Form** with **Zod resolver** for form handling because:

- Minimal re-renders (uncontrolled inputs by default)
- Built-in validation integration
- TypeScript support
- Easy error handling

### Basic Form Setup

```typescript
// apps/web/src/app/(authed)/dashboard/_components/add-thread-modal.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { createThreadInputSchema } from '~/validators/thread'

export const AddThreadModal = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createThreadInputSchema), // ← Same schema as backend!
    defaultValues: {
      title: '',
      content: '',
    },
  })
  // ...
}
```

### Controller Pattern for Custom Components

Use `Controller` when working with custom UI components that don't expose standard input refs:

```typescript
<Controller
  name="title"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <TextField
      isInvalid={!!error}                    // Show error state
      errorMessage={error?.message}          // Display error message
      inputProps={{
        placeholder: 'Enter thread title',
      }}
      label="Title"
      {...field}                             // Spread field props (value, onChange, etc.)
    />
  )}
/>
```

### Form Submission with Mutations

Connect form submission to tRPC mutations:

```typescript
<form
  onSubmit={handleSubmit((values) =>
    createThreadMutation.mutate(values)  // Type-safe mutation call
  )}
>
  {/* form fields */}
</form>
```

### Handling Success and Reset

Reset form state and close modals on successful submission:

```typescript
const createCommentMutation = useMutation(
  trpc.comment.create.mutationOptions({
    onSuccess: (newComment) => {
      // Update cache, show toast, etc.
    },
  }),
)

// In the form submission:
<form
  onSubmit={handleSubmit((values) =>
    createCommentMutation.mutate(
      { threadId, content: values.content },
      {
        onSuccess: () => {
          reset()      // Reset form fields
          onClose()    // Close modal
        },
      },
    ),
  )}
>
```

### Partial Schema Validation

When some fields are provided externally (like `threadId` from URL params), use `.omit()`:

```typescript
const { control, handleSubmit, reset } = useForm({
  resolver: zodResolver(createCommentInputSchema.omit({ threadId: true })),
  defaultValues: {
    content: '',
  },
})
```

---

## Query Cache Invalidation

### Understanding Cache Invalidation

Query cache invalidation is crucial for keeping your UI in sync with the server. The key decision is: **when to refetch vs. when to update the cache directly**.

### Strategy 1: Simple Invalidation (Refetch)

Use `invalidateQueries` when:

- The mutation affects multiple queries
- The response structure is complex
- You want to ensure fresh data

```typescript
// apps/web/src/app/(authed)/dashboard/_components/add-thread-modal.tsx
const createThreadMutation = useMutation(
  trpc.thread.create.mutationOptions({
    onSuccess: ({ id }) => {
      toast.success('Thread created successfully')
      void queryClient.invalidateQueries({
        queryKey: trpc.thread.getAll.infiniteQueryKey(), // Refetch all threads
      })
      router.push(`/threads/${id}`)
    },
  }),
)
```

### Strategy 2: Optimistic Updates (Direct Cache Manipulation)

Use `setQueryData` when:

- You want instant UI feedback
- The mutation response contains the new data
- You want to avoid unnecessary network requests

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/_components/add-comment-modal.tsx
const createCommentMutation = useMutation(
  trpc.comment.create.mutationOptions({
    onSuccess: (newComment) => {
      // 1. Update comments list directly
      queryClient.setQueryData(
        trpc.comment.getCommentsByThreadId.infiniteQueryKey({ threadId }),
        (oldData) => {
          if (!oldData) return oldData
          // Add new comment to the first page
          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                comments: [newComment, ...page.comments],
              }
            }
            return page
          })
          return { ...oldData, pages: updatedPages }
        },
      )

      // 2. Update related thread's comment count
      queryClient.setQueryData(
        trpc.thread.getById.queryKey({ id: threadId }),
        (oldThreadDetails) => {
          if (!oldThreadDetails) return oldThreadDetails
          return {
            ...oldThreadDetails,
            _count: {
              comments: oldThreadDetails._count.comments + 1,
            },
          }
        },
      )

      // 3. Invalidate list queries where calculating updates is complex
      void queryClient.invalidateQueries({
        queryKey: trpc.thread.getAll.infiniteQueryKey(),
      })
    },
  }),
)
```

### When to Use Each Strategy

| Scenario              | Strategy                         | Why                                    |
| --------------------- | -------------------------------- | -------------------------------------- |
| Creating new item     | Invalidate list queries          | Position in list may depend on sorting |
| Updating single item  | Direct cache update              | Response contains updated data         |
| Deleting item         | Direct cache update + invalidate | Remove from cache, refresh counts      |
| Complex relationships | Invalidate affected queries      | Easier to maintain                     |
| Paginated lists       | Invalidate                       | Recalculating pagination is complex    |

### Handling Duplicates with Optimistic Updates

When adding items optimistically to paginated lists, you may encounter duplicates if the user loads more pages. Handle this in the UI:

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/_components/thread-comments.tsx
const uniqueComments = useMemo(() => {
  const allComments = data?.pages.flatMap((page) => page.comments) ?? []
  const seenIds = new Set()
  return allComments.filter((comment) => {
    if (seenIds.has(comment.id)) {
      return false // Duplicate, filter it out
    }
    seenIds.add(comment.id)
    return true
  })
}, [data])
```

### Query Key Conventions

Use tRPC's generated query key helpers for type safety:

```typescript
// For a specific query
trpc.thread.getById.queryKey({ id: threadId })

// For infinite queries (pagination)
trpc.thread.getAll.infiniteQueryKey()
trpc.comment.getCommentsByThreadId.infiniteQueryKey({ threadId })
```

---

## Error Handling

### Multi-Layer Error Handling Strategy

This codebase implements error handling at multiple layers:

```
┌─────────────────────────────────────────────────────────────┐
│                 Layer 1: Global Mutation Handler             │
│           (query-client.ts - catches all mutations)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Layer 2: RSC Error Handler                   │
│          (server.tsx - handles server component errors)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Layer 3: Route-Level Handlers                │
│              (not-found.tsx, error.tsx pages)                │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: Global Mutation Error Handler

Handle common error types globally to avoid repetitive error handling:

```typescript
// apps/web/src/trpc/query-client.ts
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
        onError: (error) => {
          console.error('>>> Error in mutation', error)

          if (isTRPCClientError(error)) {
            const result = trpcHandleableErrorCodeSchema.safeParse(error)
            if (result.success) {
              const code = result.data.data.code

              if (code === 'FORBIDDEN') {
                return toast.error(
                  'You are not allowed to perform this action.',
                )
              }

              if (code === 'UNAUTHORIZED') {
                window.location.href = '/sign-in'
                return
              }

              return toast.error('The requested resource was not found.')
            }
          }

          // Default fallback
          toast.error('An unexpected error occurred. Please try again later.')
        },
      },
    },
  })
```

### Layer 2: RSC Error Handler

Handle errors from React Server Components:

```typescript
// apps/web/src/trpc/server.tsx
export const createCaller = async () =>
  callerFactory(await createContext(), {
    onError: ({ error, ctx }) => {
      switch (error.code) {
        case 'NOT_FOUND':
          return notFound() // Triggers not-found.tsx
        case 'UNAUTHORIZED':
          ctx?.session.destroy()
          return redirect('/sign-in')
        case 'FORBIDDEN':
          return forbidden() // Triggers forbidden.tsx
        default:
          console.error('>>> tRPC Error in RSC caller', error)
      }
    },
  })
```

### Layer 3: Route-Level Not Found Pages

Create custom not-found pages for better UX:

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/not-found.tsx
import { NotFoundCard } from '~/app/_components/errors/not-found-card'

export default function ThreadNotFoundPage() {
  return (
    <NotFoundCard
      title="Thread Not Found"
      message="The thread you are looking for does not exist or has been deleted."
    />
  )
}
```

### Error Type Validation

Use Zod to safely parse error codes:

```typescript
// apps/web/src/validators/trpc.ts
export const trpcHandleableErrorCodeSchema = z.object({
  data: z.object({
    code: z.enum(['FORBIDDEN', 'UNAUTHORIZED', 'NOT_FOUND']),
  }),
})
```

### Client-Side Not Found Handling

Handle not found in client components using `notFound()`:

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/_components/thread-op.tsx
'use client'

import { notFound } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'

export const ThreadOp = ({ id }: ThreadOpProps) => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.thread.getById.queryOptions({ id }),
  )

  if (!data) {
    notFound()  // Triggers the nearest not-found.tsx
  }

  return <ThreadCard thread={data} />
}
```

### Best Practices for Error Handling

1. **Always log errors** for debugging, even if you show a generic message to users
2. **Use specific error codes** (UNAUTHORIZED, FORBIDDEN, NOT_FOUND) rather than generic errors
3. **Clear sessions on auth errors** to prevent stale auth state
4. **Provide actionable error messages** that tell users what to do next
5. **Don't expose internal errors** to users - use generic messages for unexpected errors

---

## Data Fetching Patterns

### Server-Side Prefetching

Prefetch data in Server Components for instant page loads:

```typescript
// apps/web/src/app/(authed)/dashboard/page.tsx
import { prefetch, trpc } from '~/trpc/server'

export default async function DashboardPage() {
  await prefetch(trpc.thread.getAll.infiniteQueryOptions({}))

  return (
    <>
      <AddThreadModal />
      <ThreadsList />
    </>
  )
}
```

### Hydration Pattern

Use `HydrateClient` to pass server-fetched data to client components:

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/page.tsx
import { getQueryClient, HydrateClient, prefetch, trpc } from '~/trpc/server'

export default async function ThreadPage({ params }: DynamicPageProps<'threadId'>) {
  const { threadId } = await params

  // Fetch and validate in RSC
  const queryClient = getQueryClient()
  const thread = await queryClient.fetchQuery(
    trpc.thread.getById.queryOptions({ id: threadId }),
  )

  if (!thread) {
    notFound()
  }

  // Prefetch related data
  await prefetch(
    trpc.comment.getCommentsByThreadId.infiniteQueryOptions({ threadId }),
  )

  return (
    <HydrateClient>
      <ThreadOp id={threadId} />
      <ThreadComments id={threadId} />
    </HydrateClient>
  )
}
```

### Client-Side Queries with Suspense

Use `useSuspenseQuery` for automatic loading states:

```typescript
// apps/web/src/app/(authed)/threads/[threadId]/_components/thread-op.tsx
const { data } = useSuspenseQuery(trpc.thread.getById.queryOptions({ id }))
```

### Infinite Queries for Pagination

Use `useInfiniteQuery` for "load more" patterns:

```typescript
// apps/web/src/app/(authed)/dashboard/_components/threads-list.tsx
const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery(
  trpc.thread.getAll.infiniteQueryOptions(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  ),
)
```

---

## Database Layer Patterns

### Select Objects

Define what fields to select in a centralized location:

```typescript
// apps/web/src/server/modules/thread/thread.select.ts
import type { Prisma } from '@acme/db/client'

export const defaultThreadSelect = {
  id: true,
  author: {
    select: {
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
  updatedAt: true,
  title: true,
  content: true,
  // Explicitly not selecting comments - loaded separately
} satisfies Prisma.ThreadSelect
```

**Benefits:**

- Consistent data shape across queries
- Prevents over-fetching
- Single place to update when schema changes

### Service Layer Pattern

Keep database operations in service files, not routers:

```typescript
// apps/web/src/server/modules/thread/thread.service.ts
export const createThread = async ({
  title,
  content,
  authorId,
}: {
  title: string
  content: string
  authorId: string
}) => {
  const thread = await db.thread.create({
    data: {
      title,
      content,
      authorId,
    },
  })
  return thread
}
```

**Benefits:**

- Testable business logic
- Reusable across different entry points
- Clear separation of concerns

### Pagination Implementation

Use the "fetch N+1" pattern to detect if more pages exist:

```typescript
// apps/web/src/server/modules/thread/thread.service.ts
export const getAllThreadsWithPagination = async ({
  page = 1,
  limit = 5,
}: {
  page: number | undefined
  limit: number | undefined
}) => {
  const threads = await db.thread.findMany({
    take: limit + 1, // Fetch one extra to check for next page
    skip: (page - 1) * limit,
    select: defaultThreadSelect,
    orderBy: { createdAt: 'desc' },
  })

  let nextCursor: number | undefined = undefined
  if (threads.length > limit) {
    threads.pop() // Remove the extra item
    nextCursor = page + 1
  }

  return { threads, nextCursor }
}
```

---

## Type Safety

### End-to-End Type Safety

This codebase achieves full type safety from database to UI:

```
Prisma Schema → Prisma Types → Zod Schemas → tRPC → React Query → Components
```

### Router Output Types

Export and reuse router output types in components:

```typescript
// apps/web/src/trpc/types.ts
import type { inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '~/server/api/root'

export type RouterOutputs = inferRouterOutputs<AppRouter>
```

```typescript
// apps/web/src/app/(authed)/_components/thread-card.tsx
import type { RouterOutputs } from '~/trpc/types'

interface ThreadCardProps {
  thread: RouterOutputs['thread']['getAll']['threads'][number]
}
```

### Using `satisfies` for Select Objects

Use TypeScript's `satisfies` to ensure select objects match Prisma types:

```typescript
export const defaultThreadSelect = {
  // ...fields
} satisfies Prisma.ThreadSelect
```

---

## Pagination

### Schema Definition

```typescript
// apps/web/src/validators/pagination.ts
export const offsetPaginationSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z.number().optional(), // Named 'cursor' for React Query compatibility
})
```

### Router Usage

```typescript
// apps/web/src/server/api/routers/thread.ts
getAll: protectedProcedure
  .input(offsetPaginationSchema)
  .query(async ({ input }) => {
    return await getAllThreadsWithPagination({
      limit: input.limit,
      page: input.cursor,
    })
  }),
```

### Frontend Infinite Query

```typescript
const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery(
  trpc.thread.getAll.infiniteQueryOptions(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  ),
)

// Render
{hasNextPage && (
  <Button
    onPress={() => fetchNextPage()}
    isPending={isFetching}
  >
    Load More
  </Button>
)}
```

---

## Authentication & Authorization

### Protected Procedures

Use `protectedProcedure` for routes requiring authentication:

```typescript
// apps/web/src/server/api/trpc.ts
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session.userId) {
    ctx.session.destroy()
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  })
})

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware)
```

### Using Auth Context in Mutations

Access the authenticated user in mutations:

```typescript
create: protectedProcedure
  .input(createThreadInputSchema)
  .mutation(async ({ input, ctx }) => {
    const thread = await createThread({
      authorId: ctx.session.userId,  // Type-safe, guaranteed to exist
      title: input.title,
      content: input.content,
    })
    return thread
  }),
```

---

## Summary Checklist

When implementing a new CRUD feature, ensure you:

- [ ] **Validation**: Create Zod schemas in `validators/` with user-friendly error messages
- [ ] **Router**: Add tRPC procedures with proper input validation and procedure type
- [ ] **Service**: Create service functions for database operations
- [ ] **Select**: Define select objects to control data shape
- [ ] **Form**: Use React Hook Form with zodResolver for client validation
- [ ] **Cache**: Implement appropriate cache invalidation strategy
- [ ] **Errors**: Add route-level error pages (not-found.tsx)
- [ ] **Types**: Export and use router output types in components
- [ ] **Prefetch**: Prefetch data in Server Components for better UX
