import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getUserById } from '~/server/modules/user/user.service'

export const meRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    // Remember to write a new query if you want to return something different than what
    // the authMiddleware in protectedProcedure returns.
    return await getUserById(ctx.session.userId)
  }),
})
