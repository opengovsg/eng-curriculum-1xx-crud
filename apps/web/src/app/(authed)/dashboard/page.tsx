import { prefetch, trpc } from '~/trpc/server'
import { AddThreadModal } from './_components/add-thread-modal'
import { ThreadsList } from './_components/threads-list'

export default async function DashboardPage() {
  await prefetch(trpc.thread.getAll.infiniteQueryOptions({}))

  return (
    <>
      <AddThreadModal />
      <ThreadsList />
    </>
  )
}
