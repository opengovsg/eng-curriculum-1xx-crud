import { cn } from '@opengovsg/oui-theme'
import { BiComment } from 'react-icons/bi'

import { fmtDateTime } from '@acme/common/format'

import type { RouterOutputs } from '~/trpc/types'

interface ThreadCardProps {
  className?: string
  thread: RouterOutputs['thread']['getAll']['threads'][number]
}

export const ThreadCard = ({ thread, className }: ThreadCardProps) => {
  return (
    <div
      className={cn(
        'border-interaction-success-default text-base-content-default flex w-full flex-col gap-2 rounded-lg border-l-8 bg-white px-6 py-3 shadow-sm',
        className,
      )}
    >
      <div className="flex w-full flex-col justify-between gap-1 md:flex-row md:items-center">
        <span className="prose-caption-1 self-start">
          By {thread.author.name ?? thread.author.email}
        </span>
        <span className="prose-caption-1 text-base-content-medium self-end">
          {fmtDateTime(thread.updatedAt)}
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
  )
}
