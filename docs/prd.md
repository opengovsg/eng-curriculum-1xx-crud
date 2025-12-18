# Product Requirements Document: Threads & Comments Feature

## Overview

This document outlines the requirements for a discussion forum feature that allows authenticated users to create threads and post comments. The feature serves as a reference implementation demonstrating CRUD best practices in a Next.js application.

---

## Table of Contents

1. [Product Context](#product-context)
2. [User Stories](#user-stories)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Data Model](#data-model)
6. [API Specification](#api-specification)
7. [UI/UX Requirements](#uiux-requirements)
8. [Implementation Best Practices](#implementation-best-practices)
9. [Future Considerations](#future-considerations)

---

## Product Context

### Purpose

Enable users to engage in discussions through a threaded conversation system. Users can create discussion threads and comment on existing threads.

### Target Users

- Authenticated users of the platform
- Users with valid email accounts who have completed the sign-in process

### Success Metrics

- Users can successfully create threads and comments
- Data persists correctly across sessions
- UI provides instant feedback on user actions
- Error states are handled gracefully

---

## User Stories

### Thread Management

| ID  | As a...            | I want to...                                 | So that...                                   |
| --- | ------------------ | -------------------------------------------- | -------------------------------------------- |
| T1  | Authenticated user | View a list of all threads                   | I can browse available discussions           |
| T2  | Authenticated user | Create a new thread with a title and content | I can start a new discussion                 |
| T3  | Authenticated user | View a single thread's details               | I can read the full content and see comments |
| T4  | Authenticated user | See the comment count on each thread         | I can gauge engagement                       |
| T5  | Authenticated user | See the author and timestamp of threads      | I know who posted and when                   |

### Comment Management

| ID  | As a...            | I want to...                             | So that...                            |
| --- | ------------------ | ---------------------------------------- | ------------------------------------- |
| C1  | Authenticated user | View all comments on a thread            | I can follow the discussion           |
| C2  | Authenticated user | Add a comment to a thread                | I can participate in the discussion   |
| C3  | Authenticated user | See the author and timestamp of comments | I know the context of each comment    |
| C4  | Authenticated user | Load more comments when available        | I can see the full discussion history |

---

## Functional Requirements

### FR-1: Authentication Gate

- **FR-1.1**: All thread and comment endpoints MUST require authentication
- **FR-1.2**: Unauthenticated users MUST be redirected to the sign-in page
- **FR-1.3**: User session MUST be destroyed on unauthorized access attempts

### FR-2: Thread Creation

- **FR-2.1**: Users MUST provide a title (1-255 characters)
- **FR-2.2**: Users MUST provide content (1-5000 characters)
- **FR-2.3**: Thread MUST be associated with the creating user as author
- **FR-2.4**: Thread MUST have auto-generated timestamps (createdAt, updatedAt)
- **FR-2.5**: Thread MUST have a unique CUID identifier

### FR-3: Thread Listing

- **FR-3.1**: Threads MUST be displayed in reverse chronological order (newest first)
- **FR-3.2**: Listing MUST support pagination with configurable page size (1-100 items)
- **FR-3.3**: Each thread card MUST display: title, content, author (name or email), last updated time, comment count
- **FR-3.4**: Empty state MUST be shown when no threads exist

### FR-4: Thread Detail View

- **FR-4.1**: Thread detail page MUST display full thread content
- **FR-4.2**: Invalid thread IDs MUST show a "Not Found" page
- **FR-4.3**: Thread detail MUST include navigation back to the list

### FR-5: Comment Creation

- **FR-5.1**: Users MUST provide content (1-5000 characters)
- **FR-5.2**: Comment MUST be associated with:
  - The creating user as author
  - The parent thread
- **FR-5.3**: Comment MUST have auto-generated timestamps

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
```

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

---

## UI/UX Requirements

### Page Structure

```
/dashboard
├── Thread list with pagination
├── "Create new thread" button → Opens modal
└── Empty state when no threads

/threads/[threadId]
├── Back button → Returns to dashboard
├── Thread content card
├── "Add comment" button → Opens modal
├── Comments list with pagination
└── Empty state when no comments
```

### Thread Card Component

Display requirements:

- Author name (fallback to email if name is null)
- Last updated timestamp (formatted)
- Thread title (subheading style)
- Thread content (body style)
- Comment count with icon
- Hover state indicating clickability

### Comment Component

Display requirements:

- Author name (fallback to email if name is null)
- Creation timestamp (formatted)
- Comment content

### Form Modals

**Create Thread Modal:**

- Title field (text input)
- Content field (textarea, 5 rows)
- Cancel and Submit buttons
- Inline validation errors

**Add Comment Modal:**

- Content field (textarea, 5 rows)
- Cancel and Submit buttons
- Inline validation errors

### Loading & Empty States

- Loading spinners on buttons during async operations
- "Load more" button for pagination
- Descriptive empty states with guidance

### Error States

- Custom 404 page for non-existent threads
- Toast notifications for errors
- Inline validation messages on form fields

---

## Implementation Best Practices

### Architecture Patterns

1. **Layered Architecture**: Separate concerns into routers, services, and data access layers
2. **Shared Validation**: Use identical Zod schemas on client and server
3. **Select Objects**: Define reusable Prisma select objects to control data shape
4. **Type Safety**: Leverage end-to-end TypeScript types from Prisma to React

### Form Handling

1. Use React Hook Form with Zod resolver
2. Provide default values for controlled components
3. Reset form state on successful submission
4. Close modals programmatically on success

### Cache Management

1. **Optimistic Updates**: For comment creation, update cache directly for instant UI feedback
2. **Query Invalidation**: For thread creation, invalidate list queries due to sorting complexity
3. **Related Queries**: Update thread comment count when comments are added
4. **Deduplication**: Handle potential duplicates from optimistic updates in UI layer

### Error Handling

1. **Global Handler**: Centralized error handling in QueryClient for common errors
2. **Route-Level**: Custom not-found pages for better UX
3. **Form-Level**: Inline validation messages for user inputs
4. **Server-Level**: Proper tRPC error codes (UNAUTHORIZED, FORBIDDEN, NOT_FOUND)

### Server-Side Rendering

1. Prefetch data in Server Components
2. Use HydrateClient to pass data to client components
3. Handle not-found cases in RSC before rendering

---

## Future Considerations

### Planned Enhancements (Not Yet Implemented)

| Feature           | Description                                    | Priority |
| ----------------- | ---------------------------------------------- | -------- |
| Edit Thread       | Allow authors to edit their threads            | Medium   |
| Edit Comment      | Allow authors to edit their comments           | Medium   |
| Delete Thread     | Soft delete threads (schema supports this)     | Medium   |
| Delete Comment    | Soft delete comments (schema supports this)    | Medium   |
| Attachments       | File attachments on threads (schema exists)    | Low      |
| Search            | Full-text search across threads                | Low      |
| Role-Based Access | Different permissions for different user roles | Medium   |
| Rate Limiting     | Prevent spam on create endpoints               | High     |

### Schema Provisions

The current schema includes forward-looking fields:

- `deletedAt` on Thread and Comment for soft deletes
- `Attachment` model for future file upload support
- `isEnabled` on User for account management

---

## Acceptance Criteria Checklist

### Thread Management

- [ ] User can view paginated list of threads
- [ ] User can create a thread with title and content
- [ ] User can view individual thread details
- [ ] Thread displays author, timestamp, and comment count
- [ ] Empty state shown when no threads exist
- [ ] 404 page shown for invalid thread IDs

### Comment Management

- [ ] User can view paginated comments on a thread
- [ ] User can create a comment on a thread
- [ ] Comment displays author and timestamp
- [ ] Empty state shown when no comments exist
- [ ] Comments appear instantly after creation (optimistic update)

### Validation & Security

- [ ] All endpoints require authentication
- [ ] Input validation on both client and server
- [ ] User-friendly error messages displayed
- [ ] Author ID derived from server session

### Performance & UX

- [ ] Server-side prefetching on initial load
- [ ] Loading states during async operations
- [ ] Success/error toasts on mutations
- [ ] Forms reset after successful submission
