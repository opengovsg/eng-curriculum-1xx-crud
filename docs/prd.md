# Product Requirements Document: Threads & Comments CRUD Feature

## Overview

This document outlines the requirements for implementing full CRUD (Create, Read, Update, Delete) operations on a discussion forum feature. The Threads & Comments feature allows authenticated users to create, view, edit, and delete discussion threads and comments.

> **Implementation Status**: CREATE and READ operations are already implemented. This PRD focuses on completing UPDATE and DELETE operations while documenting best practices and common pitfalls for all CRUD operations.

> **Note on Designs**: No UI/UX designs are provided for this PRD. For the UPDATE and DELETE features, use your best judgement based on the existing implementation patterns in the codebase and the best practices documented in this PRD. Refer to the existing Create Thread and Add Comment modals as reference for form patterns.

---

## Table of Contents

1. [Product Context](#product-context)
2. [Implementation Status](#implementation-status)
3. [User Stories](#user-stories)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Data Model](#data-model)
7. [API Specification](#api-specification)
8. [UI/UX Requirements for Update & Delete](#uiux-requirements-for-update--delete)
9. [Best Practices & Common Footguns](#best-practices--common-footguns)
10. [Acceptance Criteria](#acceptance-criteria)

---

## Product Context

### Purpose

Enable users to engage in discussions through a threaded conversation system. Users can create discussion threads and comment on existing threads.

### Target Users

- Authenticated users of the platform
- Users with valid email accounts who have completed the sign-in process

### Success Metrics

- Users can perform all CRUD operations on threads and comments
- Data persists correctly across sessions
- UI provides instant feedback on user actions
- Error states are handled gracefully
- Only authors can modify their own content

---

## Implementation Status

| Operation         | Thread | Comment | Status            |
| ----------------- | ------ | ------- | ----------------- |
| **Create**        | ✅     | ✅      | Implemented       |
| **Read** (List)   | ✅     | ✅      | Implemented       |
| **Read** (Detail) | ✅     | N/A     | Implemented       |
| **Update**        | ❌     | ❌      | To Be Implemented |
| **Delete**        | ❌     | ❌      | To Be Implemented |

---

## User Stories

### Thread Management

| ID  | As a...            | I want to...                                 | So that...                                   | Status  |
| --- | ------------------ | -------------------------------------------- | -------------------------------------------- | ------- |
| T1  | Authenticated user | View a list of all threads                   | I can browse available discussions           | ✅ Done |
| T2  | Authenticated user | Create a new thread with a title and content | I can start a new discussion                 | ✅ Done |
| T3  | Authenticated user | View a single thread's details               | I can read the full content and see comments | ✅ Done |
| T4  | Authenticated user | See the comment count on each thread         | I can gauge engagement                       | ✅ Done |
| T5  | Authenticated user | See the author and timestamp of threads      | I know who posted and when                   | ✅ Done |
| T6  | Thread author      | Edit my thread's title and content           | I can fix mistakes or update information     | 🔲 TODO |
| T7  | Thread author      | Delete my thread                             | I can remove content I no longer want shared | 🔲 TODO |

### Comment Management

| ID  | As a...            | I want to...                             | So that...                              | Status  |
| --- | ------------------ | ---------------------------------------- | --------------------------------------- | ------- |
| C1  | Authenticated user | View all comments on a thread            | I can follow the discussion             | ✅ Done |
| C2  | Authenticated user | Add a comment to a thread                | I can participate in the discussion     | ✅ Done |
| C3  | Authenticated user | See the author and timestamp of comments | I know the context of each comment      | ✅ Done |
| C4  | Authenticated user | Load more comments when available        | I can see the full discussion history   | ✅ Done |
| C5  | Comment author     | Edit my comment's content                | I can fix mistakes or clarify my points | 🔲 TODO |
| C6  | Comment author     | Delete my comment                        | I can remove content I no longer want   | 🔲 TODO |

---

## Functional Requirements

### FR-1: Authentication Gate

- **FR-1.1**: All thread and comment endpoints MUST require authentication
- **FR-1.2**: Unauthenticated users MUST be redirected to the sign-in page
- **FR-1.3**: User session MUST be destroyed on unauthorized access attempts

### FR-2: Thread Creation ✅ Implemented

- **FR-2.1**: Users MUST provide a title (1-255 characters)
- **FR-2.2**: Users MUST provide content (1-5000 characters)
- **FR-2.3**: Thread MUST be associated with the creating user as author
- **FR-2.4**: Thread MUST have auto-generated timestamps (createdAt, updatedAt)
- **FR-2.5**: Thread MUST have a unique CUID identifier

### FR-2B: Thread Update 🔲 TODO

- **FR-2B.1**: Only the thread author MUST be able to edit their thread
- **FR-2B.2**: Updated title MUST meet same validation as creation (1-255 characters)
- **FR-2B.3**: Updated content MUST meet same validation as creation (1-5000 characters)
- **FR-2B.4**: `updatedAt` timestamp MUST be automatically updated on edit
- **FR-2B.5**: Non-authors attempting to edit MUST receive a FORBIDDEN error

### FR-2C: Thread Deletion 🔲 TODO

- **FR-2C.1**: Only the thread author MUST be able to delete their thread
- **FR-2C.2**: Deletion SHOULD be a soft delete (set `deletedAt` timestamp)
- **FR-2C.3**: Soft-deleted threads MUST NOT appear in thread listings
- **FR-2C.4**: Soft-deleted threads MUST return NOT_FOUND when accessed directly
- **FR-2C.5**: Deletion MUST show a confirmation dialog before proceeding
- **FR-2C.6**: Associated comments SHOULD remain in database but be inaccessible

### FR-3: Thread Listing

- **FR-3.1**: Threads MUST be displayed in reverse chronological order (newest first)
- **FR-3.2**: Listing MUST support pagination with configurable page size (1-100 items)
- **FR-3.3**: Each thread card MUST display: title, content, author (name or email), last updated time, comment count
- **FR-3.4**: Empty state MUST be shown when no threads exist

### FR-4: Thread Detail View

- **FR-4.1**: Thread detail page MUST display full thread content
- **FR-4.2**: Invalid thread IDs MUST show a "Not Found" page
- **FR-4.3**: Thread detail MUST include navigation back to the list

### FR-5: Comment Creation ✅ Implemented

- **FR-5.1**: Users MUST provide content (1-5000 characters)
- **FR-5.2**: Comment MUST be associated with:
  - The creating user as author
  - The parent thread
- **FR-5.3**: Comment MUST have auto-generated timestamps

### FR-5B: Comment Update 🔲 TODO

- **FR-5B.1**: Only the comment author MUST be able to edit their comment
- **FR-5B.2**: Updated content MUST meet same validation as creation (1-5000 characters)
- **FR-5B.3**: `updatedAt` timestamp MUST be automatically updated on edit
- **FR-5B.4**: Non-authors attempting to edit MUST receive a FORBIDDEN error
- **FR-5B.5**: Edited comments SHOULD display an "edited" indicator

### FR-5C: Comment Deletion 🔲 TODO

- **FR-5C.1**: Only the comment author MUST be able to delete their comment
- **FR-5C.2**: Deletion SHOULD be a soft delete (set `deletedAt` timestamp)
- **FR-5C.3**: Soft-deleted comments MUST NOT appear in comment listings
- **FR-5C.4**: Thread's comment count MUST be updated to exclude soft-deleted comments
- **FR-5C.5**: Deletion SHOULD show a confirmation dialog before proceeding

### FR-6: Comment Listing

- **FR-6.1**: Comments MUST be displayed in reverse chronological order within a thread
- **FR-6.2**: Listing MUST support pagination
- **FR-6.3**: Each comment MUST display: content, author (name or email), creation time
- **FR-6.4**: Empty state MUST be shown when no comments exist

### FR-7: Input Validation

- **FR-7.1**: All inputs MUST be validated on both client and server
- **FR-7.2**: Validation errors MUST display user-friendly messages
- **FR-7.3**: ID parameters MUST be validated as CUIDs

---

## Non-Functional Requirements

### NFR-1: Performance

- **NFR-1.1**: Thread list SHOULD load within 2 seconds
- **NFR-1.2**: Server-side prefetching SHOULD be used for initial page loads
- **NFR-1.3**: Optimistic updates SHOULD be used for comment creation to provide instant feedback
- **NFR-1.4**: Cache invalidation SHOULD minimize unnecessary network requests

### NFR-2: User Experience

- **NFR-2.1**: Forms SHOULD provide inline validation feedback
- **NFR-2.2**: Loading states SHOULD be displayed during async operations
- **NFR-2.3**: Success/error toasts SHOULD confirm action completion
- **NFR-2.4**: Modal forms SHOULD reset and close on successful submission

### NFR-3: Reliability

- **NFR-3.1**: Failed mutations SHOULD display error messages to users
- **NFR-3.2**: Duplicate comments from optimistic updates MUST be deduplicated in the UI
- **NFR-3.3**: Data integrity MUST be maintained through cascading deletes

### NFR-4: Security

- **NFR-4.1**: All CRUD operations MUST require authentication
- **NFR-4.2**: Author ID MUST be derived from server session, not client input
- **NFR-4.3**: Input MUST be validated to prevent injection attacks

---

## Data Model

### Thread Entity

| Field     | Type      | Constraints            | Description                 |
| --------- | --------- | ---------------------- | --------------------------- |
| id        | String    | Primary Key, CUID      | Unique identifier           |
| title     | String    | Required, 1-255 chars  | Thread title                |
| content   | String    | Required, 1-5000 chars | Thread body content         |
| createdAt | DateTime  | Auto-generated         | Creation timestamp          |
| updatedAt | DateTime  | Auto-updated           | Last modification timestamp |
| authorId  | String    | Foreign Key → User     | Creator's user ID           |
| deletedAt | DateTime? | Nullable               | Soft delete timestamp       |

### Comment Entity

| Field     | Type      | Constraints                 | Description                 |
| --------- | --------- | --------------------------- | --------------------------- |
| id        | Int       | Primary Key, Auto-increment | Unique identifier           |
| content   | String    | Required, 1-5000 chars      | Comment body content        |
| createdAt | DateTime  | Auto-generated              | Creation timestamp          |
| updatedAt | DateTime  | Auto-updated                | Last modification timestamp |
| authorId  | String    | Foreign Key → User          | Creator's user ID           |
| threadId  | String    | Foreign Key → Thread        | Parent thread ID            |
| deletedAt | DateTime? | Nullable                    | Soft delete timestamp       |

### Relationships

```
User (1) ──────< (N) Thread
User (1) ──────< (N) Comment
Thread (1) ────< (N) Comment
```

### Cascade Behavior

- Deleting a User cascades to all their Threads and Comments
- Deleting a Thread cascades to all its Comments

---

## API Specification

### Thread Endpoints

#### GET /api/trpc/thread.getAll

Retrieve paginated list of threads.

**Input:**

```typescript
{
  limit?: number  // 1-100, default: 5
  cursor?: number // Page number, default: 1
}
```

**Output:**

```typescript
{
  threads: Array<{
    id: string
    title: string
    content: string
    updatedAt: Date
    author: { name: string | null, email: string }
    _count: { comments: number }
  }>
  nextCursor?: number
}
```

#### GET /api/trpc/thread.getById

Retrieve a single thread by ID.

**Input:**

```typescript
{
  id: string // CUID
}
```

**Output:**

```typescript
{
  id: string
  title: string
  content: string
  updatedAt: Date
  author: { name: string | null, email: string }
  _count: { comments: number }
} | null
```

#### POST /api/trpc/thread.create

Create a new thread.

**Input:**

```typescript
{
  title: string // 1-255 characters
  content: string // 1-5000 characters
}
```

**Output:**

```typescript
{
  id: string
  title: string
  content: string
  authorId: string
}
```

#### PUT /api/trpc/thread.update 🔲 TODO

Update an existing thread. Only the author can update.

**Input:**

```typescript
{
  id: string // CUID - thread to update
  title: string // 1-255 characters
  content: string // 1-5000 characters
}
```

**Output:**

```typescript
{
  id: string
  title: string
  content: string
  updatedAt: Date
}
```

**Errors:**

- `NOT_FOUND` - Thread does not exist
- `FORBIDDEN` - User is not the author

#### DELETE /api/trpc/thread.delete 🔲 TODO

Soft delete a thread. Only the author can delete.

**Input:**

```typescript
{
  id: string // CUID - thread to delete
}
```

**Output:**

```typescript
{
  success: boolean
}
```

**Errors:**

- `NOT_FOUND` - Thread does not exist or already deleted
- `FORBIDDEN` - User is not the author

````

### Comment Endpoints

#### GET /api/trpc/comment.getCommentsByThreadId

Retrieve paginated comments for a thread.

**Input:**

```typescript
{
  threadId: string // CUID
  limit?: number   // 1-100, default: 5
  cursor?: number  // Page number
}
````

**Output:**

```typescript
{
  comments: Array<{
    id: number
    content: string
    createdAt: Date
    author: { id: string, name: string | null, email: string }
  }>
  nextCursor?: number
}
```

#### POST /api/trpc/comment.create

Create a new comment on a thread.

**Input:**

```typescript
{
  threadId: string // CUID
  content: string // 1-5000 characters
}
```

**Output:**

```typescript
{
  id: number
  content: string
  createdAt: Date
  author: { id: string, name: string | null, email: string }
}
```

#### PUT /api/trpc/comment.update 🔲 TODO

Update an existing comment. Only the author can update.

**Input:**

```typescript
{
  id: number // Comment ID to update
  content: string // 1-5000 characters
}
```

**Output:**

```typescript
{
  id: number
  content: string
  updatedAt: Date
}
```

**Errors:**

- `NOT_FOUND` - Comment does not exist
- `FORBIDDEN` - User is not the author

#### DELETE /api/trpc/comment.delete 🔲 TODO

Soft delete a comment. Only the author can delete.

**Input:**

```typescript
{
  id: number // Comment ID to delete
}
```

**Output:**

```typescript
{
  success: boolean
  threadId: string // For cache invalidation on client
}
```

**Errors:**

- `NOT_FOUND` - Comment does not exist or already deleted
- `FORBIDDEN` - User is not the author

---

## UI/UX Requirements for Update & Delete

> The CREATE and READ UI components are already implemented. This section focuses only on the UPDATE and DELETE features to be built.

### Thread Update UI

- Edit button/icon visible only to thread author on thread detail page
- Edit form (modal or inline) pre-populated with existing title and content
- Same field validation as create form
- Cancel and Save buttons
- Loading state on Save button during mutation
- Success toast and UI update on completion

### Thread Delete UI

- Delete button/icon visible only to thread author
- Confirmation dialog with clear warning message
- Loading state during deletion
- Redirect to dashboard after successful deletion
- Success toast confirming deletion

### Comment Update UI

- Edit button/icon visible only to comment author
- Inline edit or modal form pre-populated with existing content
- Same field validation as create form
- Cancel and Save buttons
- "Edited" indicator shown on updated comments
- Loading state during mutation

### Comment Delete UI

- Delete button/icon visible only to comment author
- Confirmation dialog (can be simpler than thread delete)
- Immediate removal from list on success
- Thread comment count updated
- Success toast confirming deletion

---

## Best Practices & Common Footguns

This section documents best practices for implementing CRUD operations and highlights common mistakes to avoid.

---

### 1. Input Validation

#### Best Practices

- **Share validation schemas** between client and server using Zod
- **Provide user-friendly error messages** in schema definitions
- **Validate at multiple layers**: form → tRPC input → database constraints

```typescript
// ✅ Good: Reusable schema with clear error messages
export const createThreadInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title must be at most 255 characters' }),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(5000, { message: 'Content must be at most 5000 characters' }),
})

// ✅ Good: Reuse existing schema for update
export const updateThreadInputSchema = createThreadInputSchema.extend({
  id: z.cuid(),
})
```

#### ⚠️ Common Footguns

| Footgun                            | Problem                                | Solution                               |
| ---------------------------------- | -------------------------------------- | -------------------------------------- |
| Different client/server validation | Data can pass client but fail server   | Use shared Zod schemas                 |
| Missing ID validation              | Invalid IDs reach database             | Use `z.cuid()` for CUID fields         |
| Generic error messages             | Poor UX, users don't know what's wrong | Add `{ message: '...' }` to validators |
| Not validating on update           | Edit forms can submit invalid data     | Reuse/extend creation schemas          |

---

### 2. Authorization (Ownership Checks)

#### Best Practices

- **Always check ownership server-side** before UPDATE/DELETE operations
- **Use FORBIDDEN (403)** for authorization failures, NOT_FOUND (404) for missing resources
- **Never trust client-provided authorId** - derive from session

```typescript
// ✅ Good: Server-side ownership check
update: protectedProcedure
  .input(updateThreadInputSchema)
  .mutation(async ({ input, ctx }) => {
    // First, fetch the resource to check ownership
    const thread = await db.thread.findUnique({
      where: { id: input.id },
      select: { authorId: true },
    })

    if (!thread) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    // Check ownership BEFORE any mutation
    if (thread.authorId !== ctx.session.userId) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    // Safe to update
    return db.thread.update({
      where: { id: input.id },
      data: { title: input.title, content: input.content },
    })
  })
```

#### ⚠️ Common Footguns

| Footgun                        | Problem                                     | Solution                                   |
| ------------------------------ | ------------------------------------------- | ------------------------------------------ |
| Client-side only auth checks   | Users can bypass via API calls              | Always verify server-side                  |
| Using client-provided authorId | Users can impersonate others                | Derive authorId from `ctx.session.userId`  |
| Checking auth after mutation   | Race conditions, data leaks                 | Check ownership BEFORE any database write  |
| Wrong error code (404 vs 403)  | Security info leak about resource existence | Use 403 for auth failures, 404 for missing |

---

### 3. Cache Invalidation

#### Best Practices

Choose the right strategy based on the operation:

| Operation  | Strategy                                     | Reason                                   |
| ---------- | -------------------------------------------- | ---------------------------------------- |
| **Create** | `invalidateQueries`                          | New item position depends on sorting     |
| **Update** | `setQueryData` + selective invalidate        | Update in place, refresh affected lists  |
| **Delete** | `setQueryData` to remove + invalidate counts | Remove immediately, refresh related data |

```typescript
// ✅ Good: Optimistic update for comment creation
const createCommentMutation = useMutation(
  trpc.comment.create.mutationOptions({
    onSuccess: (newComment) => {
      // 1. Optimistically add to comments list
      queryClient.setQueryData(
        trpc.comment.getCommentsByThreadId.infiniteQueryKey({ threadId }),
        (oldData) => {
          if (!oldData) return oldData
          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              return { ...page, comments: [newComment, ...page.comments] }
            }
            return page
          })
          return { ...oldData, pages: updatedPages }
        },
      )

      // 2. Update related count
      queryClient.setQueryData(
        trpc.thread.getById.queryKey({ id: threadId }),
        (old) =>
          old ? { ...old, _count: { comments: old._count.comments + 1 } } : old,
      )

      // 3. Invalidate list where recalculation is complex
      void queryClient.invalidateQueries({
        queryKey: trpc.thread.getAll.infiniteQueryKey(),
      })
    },
  }),
)
```

#### ⚠️ Common Footguns

| Footgun                                   | Problem                             | Solution                                        |
| ----------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| Invalidating everything                   | Unnecessary refetches, poor UX      | Be selective with query keys                    |
| Forgetting related queries                | Stale counts, inconsistent UI       | Update thread comment counts on comment changes |
| Not handling optimistic update duplicates | Duplicate items in lists            | Deduplicate in UI with `useMemo` and Set        |
| Over-using optimistic updates             | Complex rollback logic for failures | Use `invalidateQueries` for simpler cases       |

---

### 4. Soft Deletes

#### Best Practices

- **Filter by `deletedAt: null`** in all read queries
- **Set `deletedAt` timestamp** instead of actually deleting
- **Update related counts** to exclude soft-deleted items
- **Consider showing "deleted" state** instead of hiding entirely (for audit trails)

```typescript
// ✅ Good: Soft delete implementation
delete: protectedProcedure
  .input(z.object({ id: z.cuid() }))
  .mutation(async ({ input, ctx }) => {
    const thread = await db.thread.findUnique({
      where: { id: input.id, deletedAt: null }, // Only find non-deleted
      select: { authorId: true },
    })

    if (!thread) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    if (thread.authorId !== ctx.session.userId) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    // Soft delete: set timestamp instead of actual delete
    await db.thread.update({
      where: { id: input.id },
      data: { deletedAt: new Date() },
    })

    return { success: true }
  })

// ✅ Good: Filter out soft-deleted in reads
getAll: protectedProcedure.query(async () => {
  return db.thread.findMany({
    where: { deletedAt: null }, // Exclude soft-deleted
    orderBy: { createdAt: 'desc' },
  })
})
```

#### ⚠️ Common Footguns

| Footgun                             | Problem                                | Solution                                  |
| ----------------------------------- | -------------------------------------- | ----------------------------------------- |
| Forgetting `deletedAt: null` filter | Deleted items still appear             | Add to all read queries                   |
| Hard deleting by mistake            | Data loss, broken references           | Use soft delete pattern                   |
| Not updating counts                 | Comment count includes deleted         | Recount or decrement on delete            |
| Cascade deleting children           | Comments gone when thread soft-deleted | Keep comments, filter by thread.deletedAt |

---

### 5. Form Handling for Edit Operations

#### Best Practices

- **Pre-populate forms** with existing data for edit operations
- **Use the same validation schema** as create (or extend it)
- **Disable submit until changes are made** (optional UX improvement)
- **Handle concurrent edit conflicts** gracefully

```typescript
// ✅ Good: Edit form with pre-populated data
export const EditThreadModal = ({ thread }: { thread: Thread }) => {
  const { control, handleSubmit, formState: { isDirty } } = useForm({
    resolver: zodResolver(updateThreadInputSchema),
    defaultValues: {
      id: thread.id,
      title: thread.title,
      content: thread.content,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" isDisabled={!isDirty}>
        Save Changes
      </Button>
    </form>
  )
}
```

#### ⚠️ Common Footguns

| Footgun                       | Problem                  | Solution                                     |
| ----------------------------- | ------------------------ | -------------------------------------------- |
| Empty defaultValues on edit   | Form appears empty       | Pass existing data as defaultValues          |
| Different validation for edit | Inconsistent rules       | Extend create schema with ID field           |
| Not checking if data changed  | Unnecessary API calls    | Use `isDirty` from form state                |
| Not handling 404 on edit      | Editing deleted resource | Check if resource exists before showing form |

---

### 6. Error Handling

#### Best Practices

- **Use appropriate tRPC error codes**: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`
- **Handle errors at multiple levels**: global, route, form
- **Show actionable error messages** to users
- **Log errors server-side** for debugging

```typescript
// ✅ Good: Layered error handling

// Layer 1: Global mutation error handler (query-client.ts)
mutations: {
  onError: (error) => {
    if (isTRPCClientError(error)) {
      const code = error.data?.code
      if (code === 'FORBIDDEN') {
        toast.error('You do not have permission to perform this action.')
        return
      }
      if (code === 'NOT_FOUND') {
        toast.error('This item no longer exists.')
        return
      }
    }
    toast.error('Something went wrong. Please try again.')
  },
}

// Layer 2: Specific mutation handler
const deleteMutation = useMutation(
  trpc.thread.delete.mutationOptions({
    onError: (error) => {
      // Handle specific cases differently if needed
      if (error.data?.code === 'FORBIDDEN') {
        toast.error('You can only delete your own threads.')
      }
    },
    onSuccess: () => {
      toast.success('Thread deleted successfully')
      router.push('/dashboard')
    },
  }),
)
```

#### ⚠️ Common Footguns

| Footgun                         | Problem                        | Solution                                   |
| ------------------------------- | ------------------------------ | ------------------------------------------ |
| Swallowing errors silently      | Users don't know action failed | Always show error feedback                 |
| Exposing internal error details | Security risk                  | Use generic messages for unexpected errors |
| Not handling network errors     | App appears frozen             | Handle offline/timeout cases               |
| Inconsistent error UX           | Confusing experience           | Centralize error handling in QueryClient   |

---

### 7. UI State Management for CRUD

#### Best Practices

- **Show loading states** during mutations
- **Disable forms during submission** to prevent double-submits
- **Confirm destructive actions** with dialogs
- **Provide undo options** where possible

```typescript
// ✅ Good: Comprehensive UI state handling
const DeleteThreadButton = ({ threadId }: { threadId: string }) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const deleteMutation = useMutation(
    trpc.thread.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Thread deleted')
        router.push('/dashboard')
      },
    }),
  )

  return (
    <>
      <Button
        color="danger"
        onPress={() => setShowConfirm(true)}
        isDisabled={deleteMutation.isPending}
      >
        Delete
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteMutation.mutate({ id: threadId })}
        title="Delete Thread?"
        message="This action cannot be undone."
        isPending={deleteMutation.isPending}
      />
    </>
  )
}
```

#### ⚠️ Common Footguns

| Footgun                        | Problem                             | Solution                             |
| ------------------------------ | ----------------------------------- | ------------------------------------ |
| No loading indicator           | Users click multiple times          | Use `isPending` state on buttons     |
| No confirmation for delete     | Accidental data loss                | Always confirm destructive actions   |
| Allowing submit during pending | Duplicate submissions               | Disable form/button when `isPending` |
| Not redirecting after delete   | User stuck on deleted resource page | Navigate away on success             |

---

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Zod Schemas    │  │   React Query    │                  │
│  │  (validation)   │  │ (cache + state)  │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│  ┌────────▼────────────────────▼─────────┐                  │
│  │         React Hook Form               │                  │
│  │    (form state + validation)          │                  │
│  └───────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     tRPC Router Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Zod Schemas    │  │   Auth Check    │                   │
│  │  (validation)   │  │ (middleware)    │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                     │                                        │
│            Ownership Check (for UPDATE/DELETE)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│          (business logic, soft delete handling)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│        (Prisma + soft delete filters + cascades)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

### Thread CRUD

#### Create ✅ Implemented

- [x] User can create a thread with title and content
- [x] Validation errors shown inline
- [x] Success toast and redirect to new thread
- [x] Thread list invalidated after creation

#### Read ✅ Implemented

- [x] User can view paginated list of threads
- [x] User can view individual thread details
- [x] Thread displays author, timestamp, and comment count
- [x] Empty state shown when no threads exist
- [x] 404 page shown for invalid thread IDs

#### Update 🔲 TODO

- [ ] Edit button visible only to thread author
- [ ] Edit form pre-populated with existing data
- [ ] Same validation as create
- [ ] Success toast on update
- [ ] Thread detail and list caches updated

#### Delete 🔲 TODO

- [ ] Delete button visible only to thread author
- [ ] Confirmation dialog before deletion
- [ ] Soft delete (sets deletedAt)
- [ ] Redirect to dashboard after deletion
- [ ] Thread removed from all lists

### Comment CRUD

#### Create ✅ Implemented

- [x] User can create a comment on a thread
- [x] Comment appears instantly (optimistic update)
- [x] Thread comment count updated
- [x] Success toast on creation

#### Read ✅ Implemented

- [x] User can view paginated comments on a thread
- [x] Comment displays author and timestamp
- [x] Empty state shown when no comments exist
- [x] Duplicates from optimistic updates are handled

#### Update 🔲 TODO

- [ ] Edit button visible only to comment author
- [ ] Inline edit or modal form
- [ ] Same validation as create
- [ ] "Edited" indicator shown after update
- [ ] Comment list updated in place

#### Delete 🔲 TODO

- [ ] Delete button visible only to comment author
- [ ] Confirmation before deletion
- [ ] Soft delete (sets deletedAt)
- [ ] Comment removed from list
- [ ] Thread comment count decremented

### Security Checklist

- [x] All endpoints require authentication
- [x] Author ID derived from server session (not client)
- [x] Input validation on both client and server
- [ ] Ownership verified server-side for UPDATE/DELETE
- [ ] FORBIDDEN error for unauthorized edit/delete attempts
- [ ] Soft-deleted items filtered from all queries
