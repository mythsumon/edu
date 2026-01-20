import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'
import { createAdmin, updateAdmin, updateAdminByUsername, createInstructor, createTeacher, updateInstructor, updateTeacher, updateOwnProfile, changePassword } from '../model/account-management.service'
import type { CreateAdminRequestDto, UpdateAdminRequestDto, CreateInstructorRequestDto, UpdateInstructorRequestDto, CreateTeacherRequestDto, UpdateTeacherRequestDto, ChangePasswordRequestDto } from '../model/account-management.types'

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
 * Mutation hook for updating an existing admin
 */
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAdminRequestDto }) => {
      return await updateAdmin(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.admins() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.adminDetail(variables.id) })
    },
  })
}

/**
 * Mutation hook for updating an existing admin by username
 */
export const useUpdateAdminByUsername = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ username, data }: { username: string; data: UpdateAdminRequestDto }) => {
      return await updateAdminByUsername(username, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.admins() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.adminDetailByUsername(variables.username) })
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

/**
 * Mutation hook for updating own profile
 */
export const useUpdateOwnProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ username, roleName, data }: { 
      username: string
      roleName: string
      data: UpdateAdminRequestDto | UpdateInstructorRequestDto | UpdateTeacherRequestDto 
    }) => {
      return await updateOwnProfile(username, roleName, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.admins() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.instructors() })
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.teachers() })
      // Also invalidate current user query if it exists
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      // Invalidate instructor me query if updating instructor profile
      if (variables.roleName.toUpperCase() === 'INSTRUCTOR') {
        queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.instructorMe() })
      }
    },
  })
}

/**
 * Mutation hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequestDto) => {
      return await changePassword(data)
    },
  })
}
