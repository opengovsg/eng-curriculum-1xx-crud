import { db } from '@acme/db'

import { defaultCommentSelect } from './comment.select'

export const getCommentsByThreadIdWithPagination = async ({
  threadId,
  page = 1,
  limit = 5,
}: {
  threadId: string
  page: number | undefined
  limit: number | undefined
}) => {
  const comments = await db.comment.findMany({
    where: {
      threadId,
    },
    skip: (page - 1) * limit,
    take: limit + 1,
    select: defaultCommentSelect,
    orderBy: {
      createdAt: 'desc',
    },
  })

  let nextCursor: number | undefined = undefined

  if (comments.length > limit) {
    comments.pop()
    nextCursor = page + 1
  }

  return {
    comments,
    nextCursor,
  }
}

export const createComment = async ({
  authorId,
  threadId,
  content,
}: {
  authorId: string
  threadId: string
  content: string
}) => {
  const comment = await db.comment.create({
    data: {
      authorId,
      threadId,
      content,
    },
    select: defaultCommentSelect,
  })

  return comment
}
