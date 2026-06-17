"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "@/lib/tasks-api";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Alert, Button, Field, Input, Select, Textarea } from "./ui";

// Convert an ISO/date string to a value usable by <input type="date">.
function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

// Today's date in the YYYY-MM-DD format expected by <input type="date">.
function todayInput(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function TaskFormModal({
  task,
  onClose,
}: {
  task: Task | null; // null = create mode
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "pending");
  const [deadline, setDeadline] = useState(toDateInput(task?.deadline));
  const [titleError, setTitleError] = useState<string>();
  const [deadlineError, setDeadlineError] = useState<string>();

  const minDeadline = todayInput();

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: (input: TaskInput) =>
      isEdit ? updateTask(task!.id, input) : createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(undefined);
    if (deadline && deadline < minDeadline) {
      setDeadlineError("Deadline cannot be in the past");
      return;
    }
    setDeadlineError(undefined);
    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      deadline: deadline || null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        noValidate
      >
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit task" : "Add task"}
        </h2>

        {mutation.isError ? (
          <Alert message={(mutation.error as Error).message} />
        ) : null}

        <Field label="Title" htmlFor="title" error={titleError}>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Deadline" htmlFor="deadline" error={deadlineError}>
            <Input
              id="deadline"
              type="date"
              min={minDeadline}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
