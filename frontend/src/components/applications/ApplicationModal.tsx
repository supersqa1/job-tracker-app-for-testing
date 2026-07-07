"use client";

import { FormEvent, useMemo, useState } from "react";
import type {
  ApplicationStatus,
  JobApplication,
  JobApplicationCreate,
  RemoteType,
} from "@/lib/types";
import { KANBAN_STATUSES, STATUS_CONFIG } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { NeoButton } from "@/components/ui/NeoButton";
import {
  type ApplicationFormState,
  applicationToForm,
  formToPayload,
} from "./application-form";

interface ApplicationModalProps {
  application?: JobApplication | null;
  defaultStatus: ApplicationStatus;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: JobApplicationCreate) => Promise<void>;
}

export function ApplicationModal({
  application,
  defaultStatus,
  isSaving,
  error,
  onClose,
  onSubmit,
}: ApplicationModalProps) {
  const initialState = useMemo<ApplicationFormState>(() => {
    return applicationToForm(application, defaultStatus);
  }, [application, defaultStatus]);

  const [form, setForm] = useState<ApplicationFormState>(initialState);
  const title = application ? "Edit Application" : "New Application";

  function updateField<K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(formToPayload(form));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="precision-border custom-scrollbar flex max-h-full w-full max-w-3xl flex-col overflow-y-auto rounded-lg border-outline-variant/40 bg-surface-container-high p-0 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/40 bg-surface-container-highest/50 p-6">
          <div>
            <h2
              id="application-modal-title"
              className="font-[family-name:var(--font-headline)] text-headline-lg-mobile text-on-surface"
            >
              {title}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-mono-data)] text-xs uppercase tracking-widest text-outline-variant">
              Pipeline record
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-outline-variant/30 text-outline-variant transition-colors hover:text-on-surface"
            aria-label="Close modal"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {error && (
            <div className="border border-error/40 bg-error-container/25 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <section className="rounded border border-outline-variant/35 bg-surface-container-low p-4">
            <h3 className="mb-4 font-[family-name:var(--font-headline)] text-base font-semibold text-on-surface">
              Job Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="field-label" id="company-name-label">
                  Company
                </span>
                <input
                  aria-labelledby="company-name-label"
                  required
                  value={form.company_name}
                  onChange={(event) =>
                    updateField("company_name", event.target.value)
                  }
                  className="field-control"
                  placeholder="Acme Corp"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="role-title-label">
                  Role
                </span>
                <input
                  aria-labelledby="role-title-label"
                  required
                  value={form.role_title}
                  onChange={(event) => updateField("role_title", event.target.value)}
                  className="field-control"
                  placeholder="Senior QA Engineer"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="application-status-label">
                  Status
                </span>
                <span className="relative">
                  <select
                    aria-labelledby="application-status-label"
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as ApplicationStatus)
                    }
                    className="field-control field-select"
                  >
                    {KANBAN_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-primary-fixed-dim"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="work-mode-label">
                  Work Mode
                </span>
                <span className="relative">
                  <select
                    aria-labelledby="work-mode-label"
                    value={form.remote_type ?? ""}
                    onChange={(event) =>
                      updateField(
                        "remote_type",
                        event.target.value
                          ? (event.target.value as RemoteType)
                          : null,
                      )
                    }
                    className="field-control field-select"
                  >
                    <option value="">Unspecified</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">On-site</option>
                  </select>
                  <Icon
                    name="expand_more"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-primary-fixed-dim"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="location-label">
                  Location
                </span>
                <input
                  aria-labelledby="location-label"
                  value={form.location ?? ""}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="field-control"
                  placeholder="Seattle, WA"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="salary-label">
                  Salary
                </span>
                <input
                  aria-labelledby="salary-label"
                  value={form.salary_range ?? ""}
                  onChange={(event) =>
                    updateField("salary_range", event.target.value)
                  }
                  className="field-control"
                  placeholder="$120k - $150k"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="field-label" id="job-url-label">
                  Job URL
                </span>
                <input
                  aria-labelledby="job-url-label"
                  value={form.job_url ?? ""}
                  onChange={(event) => updateField("job_url", event.target.value)}
                  className="field-control"
                  type="url"
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          <section className="rounded border border-outline-variant/35 bg-surface-container-low p-4">
            <h3 className="mb-4 font-[family-name:var(--font-headline)] text-base font-semibold text-on-surface">
              Follow Up
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="field-label" id="next-action-label">
                  Next Action
                </span>
                <input
                  aria-labelledby="next-action-label"
                  value={form.next_action ?? ""}
                  onChange={(event) =>
                    updateField("next_action", event.target.value)
                  }
                  className="field-control"
                  placeholder="Follow up with recruiter"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label" id="next-action-date-label">
                  Next Action Date
                </span>
                <input
                  aria-labelledby="next-action-date-label"
                  value={form.next_action_at ?? ""}
                  onChange={(event) =>
                    updateField("next_action_at", event.target.value)
                  }
                  className="field-control"
                  type="datetime-local"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="field-label" id="notes-label">
                  Notes
                </span>
                <textarea
                  aria-labelledby="notes-label"
                  value={form.notes ?? ""}
                  onChange={(event) => updateField("notes", event.target.value)}
                  className="field-control min-h-28 resize-y"
                  placeholder="Interview notes, contacts, compensation details, blockers..."
                />
              </label>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/40 bg-surface-container-highest/40 p-6 sm:flex-row sm:justify-end">
          <NeoButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </NeoButton>
          <NeoButton type="submit" disabled={isSaving}>
            <Icon name={isSaving ? "sync" : "save"} className="text-[18px]" />
            {isSaving ? "Saving" : "Save Application"}
          </NeoButton>
        </div>
      </form>
    </div>
  );
}
