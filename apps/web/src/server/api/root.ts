import { meRouter } from '~/server/api/routers/me'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { authRouter } from './routers/auth/auth.router'
import { threadRouter } from './routers/thread'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => 'alive!'),
  me: meRouter,
  auth: authRouter,
  thread: threadRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
