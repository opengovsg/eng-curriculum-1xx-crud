'use client'

import { useMemo } from 'react'
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

  // Deduplicate data before rendering, as some may have been added during comment creation
  const uniqueComments = useMemo(() => {
    const allComments = data?.pages.flatMap((page) => page.comments) ?? []
    const seenIds = new Set()
    return allComments.filter((comment) => {
      if (seenIds.has(comment.id)) {
        return false // It's a duplicate, filter it out
      }
      seenIds.add(comment.id)
      return true // It's unique, keep it
    })
  }, [data])

  return (
    <div className="flex flex-col gap-2">
      {uniqueComments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col gap-0.5 rounded-sm bg-white px-6 py-3 shadow-sm"
        >
          <div className="flex w-full flex-row items-center justify-between">
            <span className="prose-caption-1">
              {comment.author.name ?? comment.author.email}
            </span>
            <span className="prose-caption-1">
              {fmtDateTime(comment.createdAt)}
            </span>
          </div>
          <div className="w-full gap-2">
            <span className="prose-body-2">{comment.content}</span>
          </div>
        </div>
      ))}
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
