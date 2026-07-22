export type UserRole = 'admin' | 'seller' | 'client';

export type AuthMethod = 'email' | 'google';

export type UserStatus = 'blocked' | 'active' | 'inactive';

export type User = {
  id: string;
  role: UserRole;
  email: string;
  username: string;
  avatar_url?: string | null;
  auth_method: AuthMethod;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  status: UserStatus;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
};

export type MeResponse = {
  user: User;
};

export type ListUserParams = {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
};

export type ListUserResponse = {
  users: User[];
  count: number;
};

export type CreateUserRequest = {
  role: UserRole;
  email: string;
  username: string;
  password: string;
  avatar_url?: string | null;
};

export type PatchUserRequest = {
  role?: UserRole;
  email?: string;
  username?: string;
  password?: string;
  avatar_url?: string | null;
  status?: UserStatus;
};

export type UserResponse = {
  user: User;
};
