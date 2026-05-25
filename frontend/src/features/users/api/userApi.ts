import { api } from '../../../shared/api/api';

import type { ListUserParams, ListUserResponse } from '../model/types';

export const usersApi = {
  getUsers: async (params?: ListUserParams) => {
    const response = await api.get<ListUserResponse>('/users', {
      params,
    });

    return response.data;
  },
};