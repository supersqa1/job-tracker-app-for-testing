import type {
  ApplicationStatus,
  JobApplication,
  JobApplicationCreate,
} from "@/lib/types";

export type ApplicationFormState = Required<
  Pick<JobApplicationCreate, "company_name" | "role_title">
> &
  Omit<JobApplicationCreate, "company_name" | "role_title">;

export const blankForm = (status: ApplicationStatus): ApplicationFormState => ({
  company_name: "",
  role_title: "",
  status,
  location: "",
  remote_type: null,
  salary_range: "",
  job_url: "",
  description: "",
  notes: "",
  next_action: "",
  next_action_at: "",
  applied_at: "",
});

export function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function applicationToForm(
  application: JobApplication | null | undefined,
  defaultStatus: ApplicationStatus,
): ApplicationFormState {
  if (!application) return blankForm(defaultStatus);

  return {
    company_name: application.company_name,
    role_title: application.role_title,
    status: application.status,
    location: application.location ?? "",
    remote_type: application.remote_type,
    salary_range: application.salary_range ?? "",
    job_url: application.job_url ?? "",
    description: application.description ?? "",
    notes: application.notes ?? "",
    next_action: application.next_action ?? "",
    next_action_at: toDatetimeLocal(application.next_action_at),
    applied_at: toDatetimeLocal(application.applied_at),
  };
}

export function formToPayload(form: ApplicationFormState): JobApplicationCreate {
  return {
    company_name: form.company_name.trim(),
    role_title: form.role_title.trim(),
    status: form.status,
    location: emptyToNull(form.location),
    remote_type: form.remote_type,
    salary_range: emptyToNull(form.salary_range),
    job_url: emptyToNull(form.job_url),
    description: emptyToNull(form.description),
    notes: emptyToNull(form.notes),
    next_action: emptyToNull(form.next_action),
    next_action_at: emptyToNull(form.next_action_at),
    applied_at: emptyToNull(form.applied_at),
  };
}
