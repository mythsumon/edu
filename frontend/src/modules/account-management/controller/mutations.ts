import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'
import { createAdmin, createInstructor, createTeacher, updateInstructor, updateTeacher } from '../model/account-management.service'
import type { CreateAdminRequestDto, CreateInstructorRequestDto, UpdateInstructorRequestDto, CreateTeacherRequestDto, UpdateTeacherRequestDto } from '../model/account-management.types'

/**
 * Mutation hook for creating a new admin
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateAdminRequestDto) => {
      return await createAdmin(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.admins() })
    },
  })
}

/**
 * Mutation hook for creating a new instructor
 */
export const useCreateInstructor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateInstructorRequestDto) => {
      return await createInstructor(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.instructors() })
    },
  })
}

/**
 * Mutation hook for updating an existing instructor
 */
export const useUpdateInstructor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateInstructorRequestDto }) => {
      return await updateInstructor(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.instructors() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.detail(variables.id) })
    },
  })
}

/**
 * Mutation hook for creating a new teacher
 */
export const useCreateTeacher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTeacherRequestDto) => {
      return await createTeacher(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.teachers() })
    },
  })
}

/**
 * Mutation hook for updating an existing teacher
 */
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTeacherRequestDto }) => {
      return await updateTeacher(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.teachers() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.teacherDetail(variables.id) })
    },
  })
}

// Placeholder mutations - to be implemented when API is available
export const useUpdateAccountManagement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      // Placeholder - replace with actual API call
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.lists() })
    },
  })
}
