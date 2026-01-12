import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse } from '@/shared/http/types/common'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  UserResponseDto,
} from './auth.types'

/**
 * Login service
 */
export async function login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
  const response = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
    '/auth/login',
    credentials
  )
  return response.data.data
}

/**
 * Logout service
 */
export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

/**
 * Refresh token service - reads refresh_token from cookie
 */
export async function refreshToken(): Promise<RefreshTokenResponseDto> {
  const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseDto>>(
    '/auth/token/refresh'
  )
  return response.data.data
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<UserResponseDto> {
  const response = await axiosInstance.get<ApiResponse<UserResponseDto>>('/user/me')
  return response.data.data
}