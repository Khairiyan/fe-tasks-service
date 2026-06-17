import { apiFetch } from "./api";
import type { PaginatedTasks, Pagination, Task, TaskInput } from "./types";

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: string; // omit or "all" to skip filtering
  search?: string;
}

// Build a fallback pagination object when the backend omits it.
function fallbackPagination(data: Task[], page: number, limit: number): Pagination {
  return {
    page,
    limit,
    total: data.length,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: page > 1,
  };
}

export async function getTasks(
  params: GetTasksParams = {},
): Promise<PaginatedTasks> {
  const { page = 1, limit = 10, status, search } = params;
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));
  if (status && status !== "all") query.set("status", status);
  if (search?.trim()) query.set("search", search.trim());

  const payload = await apiFetch<unknown>(`/tasks?${query.toString()}`);

  // Expected shape: { count, data: Task[], pagination: {...} }.
  if (payload && typeof payload === "object") {
    const obj = payload as { data?: unknown; pagination?: Pagination };
    if (Array.isArray(obj.data)) {
      const data = obj.data as Task[];
      return { data, pagination: obj.pagination ?? fallbackPagination(data, page, limit) };
    }
  }
  // Backend returned a bare array.
  if (Array.isArray(payload)) {
    return { data: payload as Task[], pagination: fallbackPagination(payload as Task[], page, limit) };
  }
  return { data: [], pagination: fallbackPagination([], page, limit) };
}

export function createTask(input: TaskInput): Promise<Task> {
  return apiFetch<Task>("/tasks", { method: "POST", body: input });
}

export function updateTask(
  id: Task["id"],
  input: TaskInput,
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, { method: "PUT", body: input });
}

export function deleteTask(id: Task["id"]): Promise<void> {
  return apiFetch<void>(`/tasks/${id}`, { method: "DELETE" });
}
