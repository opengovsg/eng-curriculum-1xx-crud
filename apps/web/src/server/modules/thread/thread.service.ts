import { db } from '@acme/db'

import { defaultThreadSelect } from './thread.select'

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

export const getAllThreadsWithPagination = async ({
  page = 1,
  limit = 5,
}: {
  page: number | undefined
  limit: number | undefined
}) => {
  const threads = await db.thread.findMany({
    take: limit + 1, // get an extra item at the end to use as next cursor
    skip: (page - 1) * limit,
    select: defaultThreadSelect,
    orderBy: {
      createdAt: 'desc',
    },
  })

  let nextCursor: number | undefined = undefined
  if (threads.length > limit) {
    threads.pop()
    nextCursor = page + 1
  }

  return {
    threads,
    nextCursor,
  }
}
