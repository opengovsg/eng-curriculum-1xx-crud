import { notFound } from 'next/navigation'

import type { DynamicPageProps } from '~/types/nextjs'
import { BackButton } from '~/app/_components/back-button'
import { getQueryClient, HydrateClient, prefetch, trpc } from '~/trpc/server'
import { AddCommentModal } from './_components/add-comment-modal'
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

  await prefetch(
    trpc.comment.getCommentsByThreadId.infiniteQueryOptions(
      {
        threadId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  )

  return (
    <HydrateClient>
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <AddCommentModal threadId={threadId} />
      </div>
      <div className="flex flex-col gap-6">
        <ThreadOp id={threadId} />
        <ThreadComments id={threadId} />
      </div>
    </HydrateClient>
  )
}
