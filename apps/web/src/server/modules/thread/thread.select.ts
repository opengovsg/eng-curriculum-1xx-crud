import type { Prisma } from '@acme/db/client'

export const defaultThreadSelect = {
  id: true,
  author: {
    select: {
      name: true,
    },
  },
  updatedAt: true,
  title: true,
  content: true,

  // Explicitly not selecting comments as that will be selected separately
} satisfies Prisma.ThreadSelect
