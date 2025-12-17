import Link from 'next/link'
import { BiComment } from 'react-icons/bi'

import { fmtDateTime } from '@acme/common/format'

import type { RouterOutputs } from '~/trpc/types'

interface ThreadCardProps {
  thread: RouterOutputs['thread']['getAll']['threads'][number]
}

export const ThreadCard = ({ thread }: ThreadCardProps) => {
  return (
    <Link href={`/threads/${thread.id}`} className="w-full">
      <div className="border-interaction-success-default flex w-full cursor-pointer flex-col gap-2 rounded-lg border-l-8 bg-white px-6 py-3 shadow-sm hover:bg-neutral-50">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="prose-caption-1">By {thread.author.name}</span>
          <span className="prose-caption-1">
            {fmtDateTime(thread.createdAt)}
          </span>
        </div>
        <div className="flex w-full flex-col gap-2">
          <span className="prose-subhead-1">{thread.title}</span>
          <span className="prose-body-2">{thread.content}</span>
        </div>
        <div className="prose-caption-2 inline-flex items-center gap-1 self-end">
          <span>{thread._count.comments} comments</span>
          <BiComment />
        </div>
      </div>
    </Link>
  )
}
