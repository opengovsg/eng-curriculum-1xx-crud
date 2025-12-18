import { resetTables } from '~tests/db/utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@acme/db'

import {
  createComment,
  getCommentsByThreadIdWithPagination,
} from '../comment.service'

describe('comment.service', () => {
  let testUserId: string
  let testThreadId: string

  beforeEach(async () => {
    await resetTables(['Comment', 'Thread', 'Account', 'User'])

    // Create a test user
    const user = await db.user.create({
      data: {
        email: 'testuser@example.com',
        name: 'Test User',
      },
    })
    testUserId = user.id

    // Create a test thread
    const thread = await db.thread.create({
      data: {
        title: 'Test Thread',
        content: 'Test thread content',
        authorId: testUserId,
      },
    })
    testThreadId = thread.id
  })

  describe('createComment', () => {
    it('should create a new comment with content', async () => {
      const commentData = {
        content: 'This is a test comment',
        authorId: testUserId,
        threadId: testThreadId,
      }

      const comment = await createComment(commentData)

      expect(comment).toBeDefined()
      expect(comment.id).toBeTruthy()
      expect(comment.content).toBe(commentData.content)
    })

    it('should return comment with author information', async () => {
      const comment = await createComment({
        content: 'Comment with author',
        authorId: testUserId,
        threadId: testThreadId,
      })

      expect(comment.author).toBeDefined()
      expect(comment.author.id).toBe(testUserId)
      expect(comment.author.email).toBe('testuser@example.com')
      expect(comment.author.name).toBe('Test User')
    })

    it('should return comment with createdAt timestamp', async () => {
      const beforeCreate = new Date()

      const comment = await createComment({
        content: 'Timestamped comment',
        authorId: testUserId,
        threadId: testThreadId,
      })

      const afterCreate = new Date()

      expect(comment.createdAt).toBeDefined()
      expect(new Date(comment.createdAt).getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      )
      expect(new Date(comment.createdAt).getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      )
    })

    it('should persist comment to database', async () => {
      const comment = await createComment({
        content: 'Persisted comment',
        authorId: testUserId,
        threadId: testThreadId,
      })

      const dbComment = await db.comment.findUnique({
        where: { id: comment.id },
      })

      expect(dbComment).toBeDefined()
      expect(dbComment?.content).toBe('Persisted comment')
      expect(dbComment?.threadId).toBe(testThreadId)
    })

    it('should allow multiple comments on the same thread', async () => {
      await createComment({
        content: 'Comment 1',
        authorId: testUserId,
        threadId: testThreadId,
      })

      await createComment({
        content: 'Comment 2',
        authorId: testUserId,
        threadId: testThreadId,
      })

      const comments = await db.comment.findMany({
        where: { threadId: testThreadId },
      })

      expect(comments).toHaveLength(2)
    })

    it('should allow comments from different authors', async () => {
      const secondUser = await db.user.create({
        data: {
          email: 'seconduser@example.com',
          name: 'Second User',
        },
      })

      const comment1 = await createComment({
        content: 'Comment from first user',
        authorId: testUserId,
        threadId: testThreadId,
      })

      const comment2 = await createComment({
        content: 'Comment from second user',
        authorId: secondUser.id,
        threadId: testThreadId,
      })

      expect(comment1.author.id).toBe(testUserId)
      expect(comment2.author.id).toBe(secondUser.id)
    })

    it('should throw error when threadId does not exist', async () => {
      await expect(
        createComment({
          content: 'Invalid comment',
          authorId: testUserId,
          threadId: 'non-existent-thread-id',
        }),
      ).rejects.toThrow()
    })

    it('should throw error when authorId does not exist', async () => {
      await expect(
        createComment({
          content: 'Invalid comment',
          authorId: 'non-existent-user-id',
          threadId: testThreadId,
        }),
      ).rejects.toThrow()
    })
  })

  describe('getCommentsByThreadIdWithPagination', () => {
    beforeEach(async () => {
      // Create multiple comments for pagination tests
      for (let i = 1; i <= 12; i++) {
        await db.comment.create({
          data: {
            content: `Comment ${i}`,
            authorId: testUserId,
            threadId: testThreadId,
            // Stagger createdAt so ordering is deterministic
            createdAt: new Date(Date.now() - (12 - i) * 1000),
          },
        })
      }
    })

    it('should return comments with default pagination (page 1, limit 5)', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 5,
      })

      expect(result.comments).toHaveLength(5)
      expect(result.nextCursor).toBe(2)
    })

    it('should return comments ordered by createdAt descending (newest first)', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 5,
      })

      // Most recent comment should be first (Comment 12)
      expect(result.comments[0]?.content).toBe('Comment 12')
      expect(result.comments[4]?.content).toBe('Comment 8')
    })

    it('should return correct comments for second page', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 2,
        limit: 5,
      })

      expect(result.comments).toHaveLength(5)
      expect(result.comments[0]?.content).toBe('Comment 7')
      expect(result.nextCursor).toBe(3)
    })

    it('should return undefined nextCursor on last page', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 3,
        limit: 5,
      })

      // Only 2 comments remain on page 3
      expect(result.comments).toHaveLength(2)
      expect(result.nextCursor).toBeUndefined()
    })

    it('should respect custom limit', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 10,
      })

      expect(result.comments).toHaveLength(10)
      expect(result.nextCursor).toBe(2)
    })

    it('should only return comments for specified thread', async () => {
      // Create another thread with its own comments
      const anotherThread = await db.thread.create({
        data: {
          title: 'Another Thread',
          content: 'Another content',
          authorId: testUserId,
        },
      })

      await db.comment.create({
        data: {
          content: 'Comment on another thread',
          authorId: testUserId,
          threadId: anotherThread.id,
        },
      })

      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 20, // Get all comments
      })

      // Should only have 12 comments from testThread, not the one from anotherThread
      expect(result.comments).toHaveLength(12)
      expect(
        result.comments.every((c) => c.content !== 'Comment on another thread'),
      ).toBe(true)
    })

    it('should return empty array when thread has no comments', async () => {
      const emptyThread = await db.thread.create({
        data: {
          title: 'Empty Thread',
          content: 'No comments here',
          authorId: testUserId,
        },
      })

      const result = await getCommentsByThreadIdWithPagination({
        threadId: emptyThread.id,
        page: 1,
        limit: 5,
      })

      expect(result.comments).toHaveLength(0)
      expect(result.nextCursor).toBeUndefined()
    })

    it('should include author information in comment select', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 1,
      })

      const comment = result.comments[0]
      expect(comment?.author).toBeDefined()
      expect(comment?.author.id).toBe(testUserId)
      expect(comment?.author.email).toBe('testuser@example.com')
      expect(comment?.author.name).toBe('Test User')
    })

    it('should include createdAt in comment select', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: 1,
        limit: 1,
      })

      expect(result.comments[0]?.createdAt).toBeDefined()
    })

    it('should use default values when page and limit are undefined', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: testThreadId,
        page: undefined,
        limit: undefined,
      })

      // Default is page 1, limit 5
      expect(result.comments).toHaveLength(5)
    })

    it('should return empty array for non-existent thread', async () => {
      const result = await getCommentsByThreadIdWithPagination({
        threadId: 'non-existent-thread-id',
        page: 1,
        limit: 5,
      })

      expect(result.comments).toHaveLength(0)
      expect(result.nextCursor).toBeUndefined()
    })
  })
})
