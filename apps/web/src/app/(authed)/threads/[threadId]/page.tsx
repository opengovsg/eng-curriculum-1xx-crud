import { notFound } from 'next/navigation'
import { Button } from '@opengovsg/oui'

import type { DynamicPageProps } from '~/types/nextjs'
import { BackButton } from '~/app/_components/back-button'
import { getQueryClient, HydrateClient, trpc } from '~/trpc/server'
import { ThreadComments } from './_components/thread-comments'
import { ThreadOp } from './_components/thread-op'

export default async function ThreadPage({
  params,
}: DynamicPageProps<'threadId'>) {
  const { threadId } = await params

  const queryClient = getQueryClient()
  const thread = await queryClient.fetchQuery(
    trpc.thread.getById.queryOptions({
      id: threadId,
    }),
  )

  if (!thread) {
    notFound()
  }

  return (
    <HydrateClient>
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <Button size="sm">Add Comment</Button>
      </div>
      <div className="flex flex-col gap-6">
        <ThreadOp id={threadId} />
        <ThreadComments id={threadId} />
      </div>
    </HydrateClient>
  )
}
