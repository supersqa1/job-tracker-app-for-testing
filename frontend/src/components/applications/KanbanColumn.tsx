import type { ApplicationStatus, JobApplication } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { ApplicationCard } from "./ApplicationCard";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: JobApplication[];
  draggingId: number | null;
  isDropTarget: boolean;
  onAdd: (status: ApplicationStatus) => void;
  onCardDragStart: (applicationId: number) => void;
  onCardDragEnd: () => void;
  onCardDrop: (status: ApplicationStatus) => void;
  onDragEnter: (status: ApplicationStatus) => void;
  onEdit: (application: JobApplication) => void;
}

export function KanbanColumn({
  status,
  applications,
  draggingId,
  isDropTarget,
  onAdd,
  onCardDragStart,
  onCardDragEnd,
  onCardDrop,
  onDragEnter,
  onEdit,
}: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => onDragEnter(status)}
      onDrop={(event) => {
        event.preventDefault();
        onCardDrop(status);
      }}
      className={cn(
        "flex h-full w-80 shrink-0 flex-col transition-colors",
        isDropTarget && "bg-primary-fixed-dim/5",
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-between border-b pb-2",
          config.borderClass,
        )}
      >
        <h2
          className={cn(
            "font-[family-name:var(--font-headline)] text-headline-md",
            config.accentClass,
          )}
        >
          {config.label}
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded border px-2 py-1 font-[family-name:var(--font-mono-data)] text-sm",
              config.badgeClass,
            )}
          >
            {applications.length}
          </span>
          <button
            type="button"
            aria-label={`Add application to ${config.label}`}
            onClick={() => onAdd(status)}
            className="flex h-8 w-8 items-center justify-center border border-outline-variant/30 text-outline-variant transition-colors hover:border-primary-fixed-dim/50 hover:text-primary-fixed-dim"
          >
            <Icon name="add" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto border border-transparent pb-4 pr-2 transition-colors",
          isDropTarget && "border-primary-fixed-dim/30",
        )}
      >
        {applications.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center border border-dashed border-outline-variant/20 p-6 text-center text-outline-variant">
            <Icon name="radar" className="mb-2 text-[32px] opacity-50" />
            <p className="font-[family-name:var(--font-mono-data)] text-sm">
              No applications in this stage.
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isDragging={draggingId === application.id}
              onDragStart={() => onCardDragStart(application.id)}
              onDragEnd={onCardDragEnd}
              onEdit={() => onEdit(application)}
            />
          ))
        )}
      </div>
    </section>
  );
}
