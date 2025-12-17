import { db } from '@acme/db'

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { offsetPaginationSchema } from '~/validators/pagination'
import { createThreadInputSchema } from '~/validators/thread'

export const threadRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(offsetPaginationSchema)
    .query(async ({ input }) => {
      const page = input.cursor ?? 1 // 1 based for ease of use, but will need conversion 0 based for skipping
      const limit = input.limit ?? 5
      const threads = await db.thread.findMany({
        take: limit + 1, // get an extra item at the end to use as next cursor
        skip: (page - 1) * limit,
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        // cursor: cursor ? { createdAt:  } : undefined,
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
    }),
  create: protectedProcedure
    .input(createThreadInputSchema)
    .mutation(async ({ input, ctx }) => {
      const thread = await db.thread.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: ctx.session.userId,
        },
      })
      return thread
    }),
})
