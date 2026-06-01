export type StoreStatus = 'active' | 'inactive' | 'blocked' | 'moderation';

export type StoreSortBy = 'created_at' | 'name';

export type SortOrder = 'asc' | 'desc';

export type StoreDTO = {
  id: string;
  name: string;
  description: string;
  slug: string;
  seller_id: string;
  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
};

export type Store = StoreDTO;

export type StoreResponse = {
  store: StoreDTO;
};

export type SellerCreateStoreRequest = {
  name: string;
  description: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type AdminCreateStoreRequest = SellerCreateStoreRequest & {
  status: StoreStatus;
  seller_id: string;
};

export type SellerPatchStoreRequest = {
  name?: string;
  description?: string;
  slug?: string;
  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type AdminPatchStoreRequest = SellerPatchStoreRequest & {
  status?: StoreStatus;
};

export type StoreFilters = {
  search: string;
  status: StoreStatus | 'all';
  seller_id: string | 'all';
  sort_by: StoreSortBy;
  sort_order: SortOrder;
};

export type ListStoreParams = {
  search?: string;
  seller_id?: string;
  status?: StoreStatus;
  offset?: number;
  limit?: number;
  sort_by?: StoreSortBy;
  sort_order?: SortOrder;
};

export type ListStoreResponse = {
  stores: StoreDTO[];
  count: number;
};
