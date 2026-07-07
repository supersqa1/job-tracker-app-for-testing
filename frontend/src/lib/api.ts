import type {
  ApiKey,
  ApiKeyCreateResponse,
  ApplicationStatus,
  ChangePasswordPayload,
  JobApplication,
  JobApplicationCreate,
  JobApplicationPage,
  LoginPayload,
  PipelineSummary,
  RegisterPayload,
  TokenResponse,
  User,
  UserUpdatePayload,
} from "./types";
import { getAuthToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3050";
const API_VERSION_PREFIX = "/api/v1";

interface ApiErrorDetail {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[];
  };
  detail?: string;
}

export class ApiRequestError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

async function parseError(response: Response): Promise<ApiRequestError> {
  const fallback = `Request failed: ${response.status}`;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const apiError = body?.error;
    const detailMessages = apiError?.details
      ?.map((detail) => detail.msg)
      .filter(Boolean)
      .join(" ");
    const message = [apiError?.message, detailMessages].filter(Boolean).join(" ");
    return new ApiRequestError(
      message || body?.detail || fallback,
      response.status,
      apiError?.code ?? null,
    );
  }

  const text = await response.text();
  return new ApiRequestError(text || fallback, response.status);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>(`${API_VERSION_PREFIX}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload): Promise<User> {
  return request<User>(`${API_VERSION_PREFIX}/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<User> {
  return request<User>(`${API_VERSION_PREFIX}/users/me`);
}

export function updateCurrentUser(payload: UserUpdatePayload): Promise<User> {
  return request<User>(`${API_VERSION_PREFIX}/users/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return request<void>(`${API_VERSION_PREFIX}/auth/change-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getApplications(params?: {
  status?: ApplicationStatus;
  search?: string;
}): Promise<JobApplication[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<JobApplication[]>(
    `${API_VERSION_PREFIX}/applications${suffix}`,
  );
}

export function getApplicationsPage(params?: {
  status?: ApplicationStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<JobApplicationPage> {
  const query = new URLSearchParams({ paginated: "true" });
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  return request<JobApplicationPage>(
    `${API_VERSION_PREFIX}/applications?${query.toString()}`,
  );
}

export function getPipelineSummary(): Promise<PipelineSummary> {
  return request<PipelineSummary>(`${API_VERSION_PREFIX}/applications/summary`);
}

export function getApplication(id: number): Promise<JobApplication> {
  return request<JobApplication>(`${API_VERSION_PREFIX}/applications/${id}`);
}

export function createApplication(
  payload: JobApplicationCreate,
): Promise<JobApplication> {
  return request<JobApplication>(`${API_VERSION_PREFIX}/applications`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateApplication(
  id: number,
  payload: Partial<JobApplicationCreate>,
): Promise<JobApplication> {
  return request<JobApplication>(`${API_VERSION_PREFIX}/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteApplication(id: number): Promise<void> {
  return request<void>(`${API_VERSION_PREFIX}/applications/${id}`, {
    method: "DELETE",
  });
}

export function getApiKeys(): Promise<ApiKey[]> {
  return request<ApiKey[]>(`${API_VERSION_PREFIX}/api-keys`);
}

export function createApiKey(payload: {
  name: string;
  expires_at?: string | null;
}): Promise<ApiKeyCreateResponse> {
  return request<ApiKeyCreateResponse>(`${API_VERSION_PREFIX}/api-keys`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateApiKey(
  id: number,
  payload: { name?: string; is_active?: boolean; expires_at?: string | null },
): Promise<ApiKey> {
  return request<ApiKey>(`${API_VERSION_PREFIX}/api-keys/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteApiKey(id: number): Promise<void> {
  return request<void>(`${API_VERSION_PREFIX}/api-keys/${id}`, {
    method: "DELETE",
  });
}
