'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TextAreaField,
  toast,
} from '@opengovsg/oui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DialogTrigger } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { BiPlus } from 'react-icons/bi'

import { useTRPC } from '~/trpc/react'
import { createCommentInputSchema } from '~/validators/comment'

export const AddCommentModal = ({ threadId }: { threadId: string }) => {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(createCommentInputSchema.omit({ threadId: true })),
    defaultValues: {
      content: '',
    },
  })

  const queryClient = useQueryClient()

  const trpc = useTRPC()

  // This mutation handling demonstrates how to optimistically update query data
  // without doing a full refetch using invalidateQueries.
  // This is more efficient and provides a snappier user experience.
  const createCommentMutation = useMutation(
    trpc.comment.create.mutationOptions({
      onSuccess: (newComment) => {
        // Not using invalidateQueries here as refetching everything would be overkill.
        queryClient.setQueryData(
          trpc.comment.getCommentsByThreadId.infiniteQueryKey({
            threadId,
          }),
          (oldData) => {
            if (!oldData) return oldData
            // Only add to first page
            const updatedPages = oldData.pages.map((page, index) => {
              // Add to first page
              if (index === 0) {
                return {
                  ...page,
                  comments: [newComment, ...page.comments],
                }
              }
              return page
            })
            return {
              ...oldData,
              pages: updatedPages,
            }
          },
        )
        toast.success('Comment added successfully')

        // Will also need to update the thread's comment count in the thread details query
        queryClient.setQueryData(
          trpc.thread.getById.queryKey({ id: threadId }),
          (oldThreadDetails) => {
            if (!oldThreadDetails) return oldThreadDetails
            return {
              ...oldThreadDetails,
              _count: {
                comments: oldThreadDetails._count.comments + 1,
              },
            }
          },
        )

        // Not updating root comments list as some desynchronisation is acceptable there
      },
    }),
  )

  return (
    <DialogTrigger>
      <Button size="sm" startContent={<BiPlus />} className="self-end">
        Add comment
      </Button>
      <Modal>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit((values) =>
                createCommentMutation.mutate(
                  {
                    threadId,
                    content: values.content,
                  },
                  {
                    onSuccess: () => {
                      reset()
                      onClose()
                    },
                  },
                ),
              )}
            >
              <ModalHeader>Add comment</ModalHeader>
              <ModalBody>
                <Controller
                  name="content"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextAreaField
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      inputProps={{
                        rows: 5,
                        placeholder: 'Enter comment content',
                      }}
                      label="Content"
                      {...field}
                    />
                  )}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="neutral" variant="reverse" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="main" type="submit">
                  Submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </DialogTrigger>
  )
}
