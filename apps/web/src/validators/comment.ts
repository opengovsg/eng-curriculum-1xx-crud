import z from 'zod'

import { offsetPaginationSchema } from './pagination'
import { getThreadByIdSchema } from './thread'

export const getCommentsByThreadIdSchema = offsetPaginationSchema.extend({
  threadId: getThreadByIdSchema.shape.id,
})

export const createCommentInputSchema = z.object({
  threadId: getThreadByIdSchema.shape.id,
  content: z.string().min(1).max(5000),
})
