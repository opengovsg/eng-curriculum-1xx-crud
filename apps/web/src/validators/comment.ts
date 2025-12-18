import { offsetPaginationSchema } from './pagination'
import { getThreadByIdSchema } from './thread'

export const getCommentsByThreadIdSchema = offsetPaginationSchema.extend({
  threadId: getThreadByIdSchema.shape.id,
})
