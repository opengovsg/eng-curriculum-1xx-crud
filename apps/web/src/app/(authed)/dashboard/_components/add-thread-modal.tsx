'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TextAreaField,
  TextField,
  toast,
} from '@opengovsg/oui'
import { useMutation } from '@tanstack/react-query'
import { DialogTrigger } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { BiPlus } from 'react-icons/bi'

import { useTRPC } from '~/trpc/react'
import { createThreadInputSchema } from '~/validators/thread'

export const AddThreadModal = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createThreadInputSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })

  const router = useRouter()

  const trpc = useTRPC()
  const createThreadMutation = useMutation(
    trpc.thread.create.mutationOptions({
      onSuccess: ({ id }) => {
        toast.success('Thread created successfully')
        router.push(`/threads/${id}`)
      },
    }),
  )

  return (
    <DialogTrigger>
      <Button size="sm" startContent={<BiPlus />} className="self-end">
        Create new thread
      </Button>
      <Modal>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={handleSubmit((values) =>
                createThreadMutation.mutate(values),
              )}
            >
              <ModalHeader>New thread</ModalHeader>
              <ModalBody>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      inputProps={{
                        placeholder: 'Enter thread title',
                      }}
                      label="Title"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="content"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextAreaField
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      inputProps={{
                        rows: 5,
                        placeholder: 'Enter thread content',
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
