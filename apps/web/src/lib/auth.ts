'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/react'

export const useAuth = () => {
  const router = useRouter()
  const trpc = useTRPC()

  const { data: user } = useQuery(trpc.me.get.queryOptions())

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        router.refresh()
      },
    }),
  )

  return { user, logout: logoutMutation.mutate }
}
