import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateInstructor, patchInstructor, patchInstructorMe, uploadSignature } from '../model/instructor-profile.service'
import type {
  InstructorUpdateRequestDto,
  InstructorPatchRequestDto,
} from '../model/instructor-profile.types'
import { instructorProfileQueryKeys } from './queryKeys'

/**
 * Update instructor mutation hook (PUT - full update)
 * Endpoint: PUT /api/v1/instructor/{userId}
 */
export const useUpdateInstructor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: InstructorUpdateRequestDto }) => {
      return await updateInstructor(userId, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate instructor query after update
      queryClient.invalidateQueries({ queryKey: instructorProfileQueryKeys.instructorById(variables.userId) })
    },
  })
}

/**
 * Patch instructor mutation hook (PATCH - partial update)
 * Endpoint: PATCH /api/v1/instructor/{userId}
 */
export const usePatchInstructor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: InstructorPatchRequestDto }) => {
      return await patchInstructor(userId, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate instructor query after patch
      queryClient.invalidateQueries({ queryKey: instructorProfileQueryKeys.instructorById(variables.userId) })
    },
  })
}

/**
 * Patch current instructor profile mutation hook (PATCH - partial update)
 * Endpoint: PATCH /api/v1/instructor/me
 */
export const usePatchInstructorMe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InstructorPatchRequestDto) => {
      return await patchInstructorMe(data)
    },
    onSuccess: () => {
      // Invalidate instructor me query after patch
      queryClient.invalidateQueries({ queryKey: instructorProfileQueryKeys.instructorMe() })
    },
  })
}

/**
 * Upload signature image mutation hook
 * Endpoint: POST /api/v1/instructor/me/signature
 */
export const useUploadSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      return await uploadSignature(file)
    },
    onSuccess: () => {
      // Invalidate instructor me query after upload
      queryClient.invalidateQueries({ queryKey: instructorProfileQueryKeys.instructorMe() })
    },
  })
}
