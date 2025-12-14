export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  data: UserEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}