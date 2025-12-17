import z from 'zod'

export const createThreadInputSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(5000),
})
