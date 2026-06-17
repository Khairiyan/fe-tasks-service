export type TaskStatus = "pending" | "in-progress" | "done";

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string | null;
  created_at?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTasks {
  data: Task[];
  pagination: Pagination;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string | null;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  done: "Done",
};
