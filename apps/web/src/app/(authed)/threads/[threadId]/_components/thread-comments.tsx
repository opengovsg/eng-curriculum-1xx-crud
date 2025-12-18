'use client'

import { Button } from '@opengovsg/oui'
import { useInfiniteQuery } from '@tanstack/react-query'

import { fmtDateTime } from '@acme/common/format'

import { useTRPC } from '~/trpc/react'

interface ThreadCommentsProps {
  id: string
}

export const ThreadComments = ({ id }: ThreadCommentsProps) => {
  const trpc = useTRPC()
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery(
    trpc.comment.getCommentsByThreadId.infiniteQueryOptions(
      {
        threadId: id,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  )

  return (
    <div className="flex flex-col gap-2">
      {data?.pages.map((page) =>
        page.comments.map((comment) => (
          <div
            key={comment.id}
            className="flex flex-col gap-0.5 rounded-sm bg-white px-6 py-3 shadow-sm"
          >
            <div className="flex w-full flex-row items-center justify-between">
              <span className="prose-caption-1">{comment.author.name}</span>
              <span className="prose-caption-1">
                {fmtDateTime(comment.createdAt)}
              </span>
            </div>
            <div className="w-full gap-2">
              <span className="prose-body-2">{comment.content}</span>
            </div>
          </div>
        )),
      )}
      {hasNextPage && (
        <Button
          className="self-end"
          variant="clear"
          color="neutral"
          size="xs"
          onPress={() => fetchNextPage()}
          isPending={isFetching}
        >
          Load more
        </Button>
      )}
    </div>
  )
}
