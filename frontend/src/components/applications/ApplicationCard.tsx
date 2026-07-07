"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { JobApplication } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn, formatRelativeDays, getInitials } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { StatusChip } from "@/components/ui/StatusChip";

interface ApplicationCardProps {
  application: JobApplication;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onEdit?: () => void;
}

export function ApplicationCard({
  application,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onEdit,
}: ApplicationCardProps) {
  const router = useRouter();
  const didDragRef = useRef(false);
  const statusConfig = STATUS_CONFIG[application.status];
  const isActive = application.status === "in_progress";
  const isApplied = application.status === "applied";
  const referenceDate =
    application.next_action_at ?? application.applied_at ?? application.updated_at;

  return (
    <article
      draggable
      onDragStart={() => {
        didDragRef.current = true;
        onDragStart?.();
      }}
      onDragEnd={() => {
        onDragEnd?.();
        window.setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }}
      onClick={() => {
        if (didDragRef.current) return;
        router.push(`/jobs/${application.id}`);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/jobs/${application.id}`);
        }
      }}
      role="link"
      tabIndex={0}
      className={cn(
        "group block cursor-grab transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim/60 active:cursor-grabbing",
        isActive && "shadow-[0_0_15px_rgba(78,222,163,0.1)]",
        isDragging && "opacity-40",
      )}
    >
      <div
        className={cn(
          "glass-pane precision-border relative p-[1px]",
          isActive && "border-secondary/30",
          isApplied &&
            "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-primary-fixed-dim",
          isActive &&
            "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-secondary",
        )}
      >
        <div className="relative flex h-full flex-col gap-4 overflow-hidden bg-surface-container-low/80 p-6">
          {isActive && (
            <div className="pointer-events-none absolute -right-10 -top-10 mr-0 h-32 w-32 rounded-full bg-secondary/5 blur-2xl" />
          )}

          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm",
                isActive && "border-secondary/30",
              )}
            >
              <span
                className={cn(
                  "font-[family-name:var(--font-display)] text-sm font-bold text-primary-fixed-dim",
                  isActive && "text-secondary",
                )}
              >
                {getInitials(application.company_name)}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "flex items-center gap-1 font-[family-name:var(--font-mono-data)] text-sm text-outline-variant",
                  isActive && "text-secondary",
                )}
              >
                {isActive ? (
                  <>
                    <Icon name="bolt" className="text-[14px]" />
                    Active
                  </>
                ) : (
                  <>
                    <Icon name="schedule" className="text-[14px]" />
                    {formatRelativeDays(referenceDate)}
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label={`Edit ${application.company_name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.();
                }}
                className="flex h-7 w-7 items-center justify-center border border-outline-variant/30 bg-black/20 text-outline-variant transition-colors hover:border-primary-fixed-dim/50 hover:text-primary-fixed-dim"
              >
                <Icon name="edit" className="text-[16px]" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
              {application.company_name}
            </h3>
            <p
              className={cn(
                "mt-1 font-[family-name:var(--font-label)] text-xs uppercase tracking-wider",
                statusConfig.accentClass,
              )}
            >
              {application.role_title}
            </p>
          </div>

          {(application.remote_type || application.salary_range) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {application.remote_type && (
                <StatusChip className="border-outline-variant/50 bg-black/20 text-outline">
                  {application.remote_type.replace("_", "-")}
                </StatusChip>
              )}
              {application.salary_range && (
                <StatusChip className="border-outline-variant/50 bg-black/20 text-outline">
                  {application.salary_range}
                </StatusChip>
              )}
            </div>
          )}

          {application.next_action && (
            <div className="mt-4 border-t border-outline-variant/30 pt-4">
              <p className="mb-2 font-[family-name:var(--font-mono-data)] text-[12px] text-outline-variant">
                Next Action
              </p>
              <div className="flex items-center justify-between rounded border border-outline-variant/20 bg-black/30 p-2">
                <span className="font-[family-name:var(--font-label)] text-xs uppercase text-on-surface">
                  {application.next_action}
                </span>
                <span className="font-[family-name:var(--font-mono-data)] text-[11px] text-primary-fixed-dim">
                  {formatRelativeDays(application.next_action_at)}
                </span>
              </div>
            </div>
          )}

          {isApplied && (
            <div className="mt-2 flex items-center gap-2">
              <Icon name="check_circle" className="text-[16px] text-secondary" />
              <span className="font-[family-name:var(--font-mono-data)] text-[12px] text-outline-variant">
                Application Sent
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
