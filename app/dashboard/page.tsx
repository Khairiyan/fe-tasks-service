"use client";

import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteTask, getTasks } from "@/lib/tasks-api";
import type { Task, TaskStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { TaskFormModal } from "@/components/TaskFormModal";
import { Alert, Button, Input, Select } from "@/components/ui";

type StatusFilter = TaskStatus | "all";

const PAGE_SIZE = 5;

const statusStyles: Record<TaskStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't refetch on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Reset to the first page whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["tasks", page, PAGE_SIZE, statusFilter, debouncedSearch],
    queryFn: () =>
      getTasks({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const total = pagination?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: Task["id"]) => deleteTask(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalOpen(true);
  }

  function handleDelete(task: Task) {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteMutation.mutate(task.id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">My tasks</h2>
        <Button onClick={openCreate}>+ Add task</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Search tasks"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="max-w-[10rem]"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {deleteMutation.isError ? (
        <Alert message={(deleteMutation.error as Error).message} />
      ) : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading tasks…</p>
      ) : isError ? (
        <Alert message={(error as Error).message} />
      ) : tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {statusFilter === "all" && !debouncedSearch
            ? "No tasks yet. Add your first one!"
            : "No tasks match your filters."}
        </p>
      ) : (
        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : ""}>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{task.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.description ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {task.description}
                  </p>
                ) : null}
                {task.deadline ? (
                  <p className="text-xs text-zinc-500">
                    Deadline: {task.deadline.slice(0, 10)}
                  </p>
                ) : null}
                {task.created_at ? (
                  <p className="text-xs text-zinc-400">
                    Created: {new Date(task.created_at).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => openEdit(task)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(task)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination?.hasPrevPage || isPlaceholderData}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination?.hasNextPage || isPlaceholderData}
            >
              Next
            </Button>
          </div>
        </div>
        </div>
      )}

      {modalOpen ? (
        <TaskFormModal task={editing} onClose={() => setModalOpen(false)} />
      ) : null}
    </div>
  );
}
