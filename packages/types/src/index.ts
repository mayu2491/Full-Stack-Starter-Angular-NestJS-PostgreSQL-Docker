export type Role = 'guest' | 'member' | 'admin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: SessionUser;
  tokens: AuthTokens;
}

export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: 'planned' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
