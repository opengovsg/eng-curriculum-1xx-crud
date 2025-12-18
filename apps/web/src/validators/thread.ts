import z from 'zod'

export const createThreadInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title must be at most 255 characters' }),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(5000, { message: 'Content must be at most 5000 characters' }),
})

export const getThreadByIdSchema = z.object({
  id: z.cuid(),
})
