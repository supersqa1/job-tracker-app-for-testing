import { KANBAN_STATUSES } from "@/lib/constants";
import type { ApplicationStatus, JobApplication } from "@/lib/types";

export function buildSummary(applications: JobApplication[]) {
  return KANBAN_STATUSES.reduce(
    (summary, status) => {
      summary[status] = applications.filter((app) => app.status === status).length;
      return summary;
    },
    { total: applications.length } as Record<ApplicationStatus | "total", number>,
  );
}

export function filterApplications(
  applications: JobApplication[],
  query: string,
): JobApplication[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return applications;

  return applications.filter((application) =>
    [
      application.company_name,
      application.role_title,
      application.location ?? "",
      application.next_action ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

export function countDueApplications(
  applications: JobApplication[],
  now = new Date(),
): number {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return applications.filter((application) => {
    if (!application.next_action_at) return false;
    return new Date(application.next_action_at) <= endOfToday;
  }).length;
}
