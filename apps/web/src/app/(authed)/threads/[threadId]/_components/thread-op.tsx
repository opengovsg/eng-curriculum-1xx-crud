'use client'

import { notFound } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'

import { ThreadCard } from '~/app/(authed)/_components/thread-card'
import { useTRPC } from '~/trpc/react'

interface ThreadOpProps {
  id: string
}

export const ThreadOp = ({ id }: ThreadOpProps) => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.thread.getById.queryOptions({
      id,
    }),
  )

  if (!data) {
    notFound()
  }

  return <ThreadCard thread={data} />
}
