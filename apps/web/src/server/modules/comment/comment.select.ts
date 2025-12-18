import type { Prisma } from '@acme/db/client'

export const defaultCommentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.CommentSelect
