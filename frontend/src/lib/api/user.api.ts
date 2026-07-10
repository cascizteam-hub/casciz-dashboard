import apiClient from './client'
import type { ApiResponse, ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '@/types'

export const userApi = {
  getMe() {
    return apiClient.get<ApiResponse<UserProfile>>('/users/me')
  },

  updateMe(data: UpdateProfileRequest) {
    return apiClient.patch<ApiResponse<UserProfile>>('/users/me', data)
  },

  changePassword(data: ChangePasswordRequest) {
    return apiClient.put<ApiResponse<void>>('/users/me/password', data)
  },
}
