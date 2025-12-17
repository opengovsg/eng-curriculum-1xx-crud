'use client'

import { Button } from '@opengovsg/oui'
import { useInfiniteQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/react'
import { ThreadCard } from './thread-card'

export const ThreadsList = () => {
  const trpc = useTRPC()
  const { data, fetchNextPage, isFetching, hasNextPage } = useInfiniteQuery(
    trpc.thread.getAll.infiniteQueryOptions(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  )

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {data?.pages.map((page) =>
          page.threads.map((thread) => (
            <li key={thread.id}>
              <ThreadCard thread={thread} />
            </li>
          )),
        )}
      </ul>
      <div className="flex justify-center">
        {hasNextPage ? (
          <Button
            variant="reverse"
            onPress={() => fetchNextPage()}
            isPending={isFetching}
          >
            Load More
          </Button>
        ) : (
          <div>No more threads</div>
        )}
      </div>
    </div>
  )
}
