import { NotFoundCard } from '~/app/_components/errors/not-found-card'

export default function ThreadNotFoundPage() {
  return (
    <NotFoundCard
      title="Thread Not Found"
      message="The thread you are looking for does not exist or has been deleted."
    />
  )
}
