import { db } from '@acme/db'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { defaultThreadSelect } from '~/server/modules/thread/thread.select'
import {
  createThread,
  getAllThreadsWithPagination,
} from '~/server/modules/thread/thread.service'
import { offsetPaginationSchema } from '~/validators/pagination'
import {
  createThreadInputSchema,
  getThreadByIdSchema,
} from '~/validators/thread'

export const threadRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(offsetPaginationSchema)
    .query(async ({ input }) => {
      return await getAllThreadsWithPagination({
        limit: input.limit,
        page: input.cursor,
      })
    }),
  getById: protectedProcedure
    .input(getThreadByIdSchema)
    .query(async ({ input }) => {
      const thread = await db.thread.findUnique({
        where: {
          id: input.id,
        },
        select: defaultThreadSelect,
      })
      return thread
    }),
  create: protectedProcedure
    .input(createThreadInputSchema)
    .mutation(async ({ input, ctx }) => {
      const thread = await createThread({
        authorId: ctx.session.userId,
        title: input.title,
        content: input.content,
      })
      return thread
    }),
})
