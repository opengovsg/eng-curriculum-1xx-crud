import {
  createComment,
  getCommentsByThreadIdWithPagination,
} from '~/server/modules/comment/comment.service'
import {
  createCommentInputSchema,
  getCommentsByThreadIdSchema,
} from '~/validators/comment'
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

  create: protectedProcedure
    .input(createCommentInputSchema)
    .mutation(async ({ input, ctx }) => {
      const comment = await createComment({
        authorId: ctx.session.userId,
        threadId: input.threadId,
        content: input.content,
      })
      return comment
    }),
})
