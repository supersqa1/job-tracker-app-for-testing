import type { ApplicationStatus } from "./types";

export interface StatusConfig {
  label: string;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
}

export const KANBAN_STATUSES: ApplicationStatus[] = [
  "potential",
  "applied",
  "in_progress",
  "final_stage",
];

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  potential: {
    label: "Potential",
    accentClass: "text-on-surface",
    borderClass: "border-outline-variant/30",
    badgeClass: "bg-surface-variant/50 text-outline border-outline-variant/30",
  },
  applied: {
    label: "Applied",
    accentClass: "text-primary-fixed-dim",
    borderClass: "border-primary-fixed-dim/30",
    badgeClass:
      "bg-primary-fixed-dim/20 text-primary-fixed-dim border-primary-fixed-dim/30",
  },
  in_progress: {
    label: "In-Progress",
    accentClass: "text-secondary",
    borderClass: "border-secondary/30",
    badgeClass: "bg-secondary/20 text-secondary border-secondary/30",
  },
  final_stage: {
    label: "Final Stage",
    accentClass: "text-tertiary-fixed-dim",
    borderClass: "border-tertiary-fixed-dim/30",
    badgeClass:
      "bg-tertiary-fixed-dim/20 text-tertiary-fixed-dim border-tertiary-fixed-dim/30",
  },
  hired: {
    label: "Hired",
    accentClass: "text-secondary",
    borderClass: "border-secondary/30",
    badgeClass: "bg-secondary/20 text-secondary border-secondary/30",
  },
  rejected: {
    label: "Rejected",
    accentClass: "text-error",
    borderClass: "border-error/30",
    badgeClass: "bg-error-container/40 text-error border-error/30",
  },
  withdrawn: {
    label: "Withdrawn",
    accentClass: "text-error",
    borderClass: "border-error/30",
    badgeClass: "bg-error-container/40 text-error border-error/30",
  },
};

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/jobs", label: "Jobs", icon: "work" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/interviews", label: "Interviews", icon: "event_upcoming" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;
