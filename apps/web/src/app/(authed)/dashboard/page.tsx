import { prefetch, trpc } from '~/trpc/server'
import { AddThreadModal } from './_components/add-thread-modal'
import { ThreadsList } from './_components/threads-list'

export default async function DashboardPage() {
  await prefetch(trpc.thread.getAll.infiniteQueryOptions({}))

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4">
      <AddThreadModal />
      <ThreadsList />
    </div>
  )
}
