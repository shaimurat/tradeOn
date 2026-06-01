import { api } from '../../../shared/api/api';
import { useAuthStore } from '../../auth/model/authStore';

import type {
  AdminCreateStoreRequest,
  AdminPatchStoreRequest,
  ListStoreParams,
  ListStoreResponse,
  SellerCreateStoreRequest,
  SellerPatchStoreRequest,
  StoreResponse,
} from '../model/types';

const getCurrentUserRole = () => {
  return useAuthStore.getState().user?.role;
};

const getSellerListParams = (
  params?: ListStoreParams
): Omit<ListStoreParams, 'seller_id'> | undefined => {
  if (!params) {
    return undefined;
  }

  const { seller_id: _sellerId, ...sellerParams } = params;

  return sellerParams;
};

export const storesApi = {
  getStores: async (params?: ListStoreParams) => {
    const response = await api.get<ListStoreResponse>('/stores', {
      params,
    });

    return response.data;
  },

  getSellerStores: async (params?: Omit<ListStoreParams, 'seller_id'>) => {
    const response = await api.get<ListStoreResponse>('/stores/seller', {
      params,
    });

    return response.data;
  },

  getMyStores: async (params?: ListStoreParams) => {
    const role = getCurrentUserRole();

    if (role === 'seller') {
      const response = await api.get<ListStoreResponse>('/stores/seller', {
        params: getSellerListParams(params),
      });

      return response.data;
    }

    const response = await api.get<ListStoreResponse>('/stores', {
      params,
    });

    return response.data;
  },

  getStoreById: async (id: string) => {
    const response = await api.get<StoreResponse>(`/stores/${id}`);

    return response.data.store;
  },

  getStoreBySlug: async (slug: string) => {
    const response = await api.get<StoreResponse>(`/stores/slug/${slug}`);

    return response.data.store;
  },

  adminCreateStore: async (payload: AdminCreateStoreRequest) => {
    const response = await api.post<StoreResponse>('/stores/admin', payload);

    return response.data.store;
  },

  sellerCreateStore: async (payload: SellerCreateStoreRequest) => {
    const response = await api.post<StoreResponse>('/stores/seller', payload);

    return response.data.store;
  },

  createStore: async (payload: SellerCreateStoreRequest | AdminCreateStoreRequest) => {
    const role = getCurrentUserRole();

    if (role === 'seller') {
      const response = await api.post<StoreResponse>(
        '/stores/seller',
        payload as SellerCreateStoreRequest
      );

      return response.data.store;
    }

    if (role === 'admin') {
      const response = await api.post<StoreResponse>(
        '/stores/admin',
        payload as AdminCreateStoreRequest
      );

      return response.data.store;
    }

    throw new Error('You do not have permission to create store');
  },

  adminPatchStore: async (id: string, payload: AdminPatchStoreRequest) => {
    const response = await api.patch<StoreResponse>(`/stores/admin/${id}`, payload);

    return response.data.store;
  },

  sellerPatchStore: async (id: string, payload: SellerPatchStoreRequest) => {
    const response = await api.patch<StoreResponse>(`/stores/seller/${id}`, payload);

    return response.data.store;
  },

  patchStore: async (id: string, payload: SellerPatchStoreRequest | AdminPatchStoreRequest) => {
    const role = getCurrentUserRole();

    if (role === 'seller') {
      const response = await api.patch<StoreResponse>(
        `/stores/seller/${id}`,
        payload as SellerPatchStoreRequest
      );

      return response.data.store;
    }

    if (role === 'admin') {
      const response = await api.patch<StoreResponse>(
        `/stores/admin/${id}`,
        payload as AdminPatchStoreRequest
      );

      return response.data.store;
    }

    throw new Error('You do not have permission to update store');
  },

  adminDeleteStore: async (id: string) => {
    await api.delete(`/stores/admin/${id}`);
  },

  sellerDeleteStore: async (id: string) => {
    await api.delete(`/stores/seller/${id}`);
  },

  deleteStore: async (id: string) => {
    const role = getCurrentUserRole();

    if (role === 'seller') {
      await api.delete(`/stores/seller/${id}`);
      return;
    }

    if (role === 'admin') {
      await api.delete(`/stores/admin/${id}`);
      return;
    }

    throw new Error('You do not have permission to delete store');
  },
};
