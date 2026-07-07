export type ApplicationStatus =
  | "potential"
  | "applied"
  | "in_progress"
  | "final_stage"
  | "hired"
  | "rejected"
  | "withdrawn";

export type RemoteType = "remote" | "hybrid" | "on_site";

export interface JobApplication {
  id: number;
  company_name: string;
  role_title: string;
  status: ApplicationStatus;
  location: string | null;
  remote_type: RemoteType | null;
  salary_range: string | null;
  job_url: string | null;
  description: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationPage {
  items: JobApplication[];
  total: number;
  limit: number;
  offset: number;
}

export interface PipelineSummary {
  potential: number;
  applied: number;
  in_progress: number;
  final_stage: number;
  hired: number;
  rejected: number;
  withdrawn: number;
  total: number;
}

export interface JobApplicationCreate {
  company_name: string;
  role_title: string;
  status?: ApplicationStatus;
  location?: string | null;
  remote_type?: RemoteType | null;
  salary_range?: string | null;
  job_url?: string | null;
  description?: string | null;
  notes?: string | null;
  next_action?: string | null;
  next_action_at?: string | null;
  applied_at?: string | null;
}

export type UserRole = "user" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface UserUpdatePayload {
  full_name?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyCreateResponse extends ApiKey {
  api_key: string;
}
