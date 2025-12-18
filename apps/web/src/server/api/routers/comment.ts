import { getCommentsByThreadIdWithPagination } from '~/server/modules/comment/comment.service'
import { getCommentsByThreadIdSchema } from '~/validators/comment'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const commentRouter = createTRPCRouter({
  getCommentsByThreadId: protectedProcedure
    .input(getCommentsByThreadIdSchema)
    .query(async ({ input }) => {
      return getCommentsByThreadIdWithPagination({
        threadId: input.threadId,
        limit: input.limit,
        page: input.cursor,
      })
    }),
})
