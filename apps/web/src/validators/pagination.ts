import { z } from 'zod'

export const offsetPaginationSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  // This is the page number for pagination. The key is required to be `cursor` to allow for use with
  // react-query's cursor-based pagination helpers
  cursor: z.number().optional(),
})
