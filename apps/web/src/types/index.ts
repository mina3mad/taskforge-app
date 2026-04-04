export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER' | 'QA';
export type UserGender = 'Male' | 'Female' | 'PreferNotToSay';

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'QA'
  | 'DONE'
  | 'REOPENED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: UserGender;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: string;
  assignee?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}
