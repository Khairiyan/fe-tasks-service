import { apiFetch } from "./api";
import type { AuthResponse } from "./types";

export function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerRequest(
  name: string,
  email: string,
  password: string,
) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}
