'use client'

import Link from 'next/link'
import { Button } from '@opengovsg/oui'
import { useInfiniteQuery } from '@tanstack/react-query'

import { EmptyPlaceholder } from '@acme/ui/empty-placeholder'

import { useTRPC } from '~/trpc/react'
import { ThreadCard } from '../../_components/thread-card'

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

  if (data?.pages[0]?.threads.length === 0) {
    // TODO: Update the title and description based on user role in the future
    return (
      <EmptyPlaceholder
        title="No threads yet"
        description="Create a new thread to get started!"
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {data?.pages.map((page) =>
          page.threads.map((thread) => (
            <li key={thread.id}>
              <Link href={`/threads/${thread.id}`} className="w-full">
                <ThreadCard
                  className="cursor-pointer hover:bg-neutral-50"
                  thread={thread}
                />
              </Link>
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
