import { api } from '../../../shared/api/api';

import type {
  CreateUserRequest,
  ListUserParams,
  ListUserResponse,
  PatchUserRequest,
  UserResponse,
} from '../model/types';

export const usersApi = {
  getUsers: async (params?: ListUserParams) => {
    const response = await api.get<ListUserResponse>('/users', {
      params,
    });

    return response.data;
  },
  createUser: async (payload: CreateUserRequest) => {
    const response = await api.post<UserResponse>('/users', payload);

    return response.data.user;
  },
  patchUser: async (id: string, payload: PatchUserRequest) => {
    const response = await api.patch<UserResponse>(`/users/${id}`, payload);

    return response.data.user;
  },
  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};
