import { resetTables } from '~tests/db/utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@acme/db'

import { createThread, getAllThreadsWithPagination } from '../thread.service'

describe('thread.service', () => {
  let testUserId: string

  beforeEach(async () => {
    await resetTables(['Comment', 'Thread', 'Account', 'User'])

    // Create a test user for creating threads
    const user = await db.user.create({
      data: {
        email: 'testuser@example.com',
        name: 'Test User',
      },
    })
    testUserId = user.id
  })

  describe('createThread', () => {
    it('should create a new thread with title and content', async () => {
      const threadData = {
        title: 'Test Thread Title',
        content: 'Test thread content',
        authorId: testUserId,
      }

      const thread = await createThread(threadData)

      expect(thread).toBeDefined()
      expect(thread.id).toBeTruthy()
      expect(thread.title).toBe(threadData.title)
      expect(thread.content).toBe(threadData.content)
      expect(thread.authorId).toBe(testUserId)
    })

    it('should persist thread to database', async () => {
      const threadData = {
        title: 'Persisted Thread',
        content: 'This should be saved',
        authorId: testUserId,
      }

      const thread = await createThread(threadData)

      const dbThread = await db.thread.findUnique({
        where: { id: thread.id },
      })

      expect(dbThread).toBeDefined()
      expect(dbThread?.title).toBe(threadData.title)
      expect(dbThread?.content).toBe(threadData.content)
    })

    it('should create multiple threads for the same author', async () => {
      await createThread({
        title: 'Thread 1',
        content: 'Content 1',
        authorId: testUserId,
      })

      await createThread({
        title: 'Thread 2',
        content: 'Content 2',
        authorId: testUserId,
      })

      const threads = await db.thread.findMany({
        where: { authorId: testUserId },
      })

      expect(threads).toHaveLength(2)
    })

    it('should throw error when authorId does not exist', async () => {
      const threadData = {
        title: 'Invalid Thread',
        content: 'This should fail',
        authorId: 'non-existent-user-id',
      }

      await expect(createThread(threadData)).rejects.toThrow()
    })
  })

  describe('getAllThreadsWithPagination', () => {
    beforeEach(async () => {
      // Create multiple threads for pagination tests
      for (let i = 1; i <= 12; i++) {
        await db.thread.create({
          data: {
            title: `Thread ${i}`,
            content: `Content for thread ${i}`,
            authorId: testUserId,
            // Stagger createdAt so ordering is deterministic
            createdAt: new Date(Date.now() - (12 - i) * 1000),
          },
        })
      }
    })

    it('should return threads with default pagination (page 1, limit 5)', async () => {
      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 5,
      })

      expect(result.threads).toHaveLength(5)
      expect(result.nextCursor).toBe(2)
    })

    it('should return threads ordered by createdAt descending (newest first)', async () => {
      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 5,
      })

      // Most recent thread should be first (Thread 12)
      expect(result.threads[0]?.title).toBe('Thread 12')
      expect(result.threads[4]?.title).toBe('Thread 8')
    })

    it('should return correct threads for second page', async () => {
      const result = await getAllThreadsWithPagination({
        page: 2,
        limit: 5,
      })

      expect(result.threads).toHaveLength(5)
      expect(result.threads[0]?.title).toBe('Thread 7')
      expect(result.nextCursor).toBe(3)
    })

    it('should return undefined nextCursor on last page', async () => {
      const result = await getAllThreadsWithPagination({
        page: 3,
        limit: 5,
      })

      // Only 2 threads remain on page 3
      expect(result.threads).toHaveLength(2)
      expect(result.nextCursor).toBeUndefined()
    })

    it('should respect custom limit', async () => {
      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 10,
      })

      expect(result.threads).toHaveLength(10)
      expect(result.nextCursor).toBe(2)
    })

    it('should return empty array when no threads exist', async () => {
      await resetTables(['Comment', 'Thread'])

      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 5,
      })

      expect(result.threads).toHaveLength(0)
      expect(result.nextCursor).toBeUndefined()
    })

    it('should include author information in thread select', async () => {
      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 1,
      })

      const thread = result.threads[0]
      expect(thread?.author).toBeDefined()
      expect(thread?.author.email).toBe('testuser@example.com')
      expect(thread?.author.name).toBe('Test User')
    })

    it('should include comment count in thread select', async () => {
      // Add comments to the most recent thread
      const threads = await db.thread.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1,
      })
      const latestThread = threads[0]

      if (!latestThread) {
        throw new Error('Expected at least one thread')
      }

      await db.comment.createMany({
        data: [
          {
            threadId: latestThread.id,
            content: 'Comment 1',
            authorId: testUserId,
          },
          {
            threadId: latestThread.id,
            content: 'Comment 2',
            authorId: testUserId,
          },
        ],
      })

      const result = await getAllThreadsWithPagination({
        page: 1,
        limit: 1,
      })

      expect(result.threads[0]?._count.comments).toBe(2)
    })

    it('should use default values when page and limit are undefined', async () => {
      const result = await getAllThreadsWithPagination({
        page: undefined,
        limit: undefined,
      })

      // Default is page 1, limit 5
      expect(result.threads).toHaveLength(5)
    })
  })
})
