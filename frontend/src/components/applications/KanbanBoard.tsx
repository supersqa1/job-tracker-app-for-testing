import type { ApplicationStatus, JobApplication } from "@/lib/types";
import { KANBAN_STATUSES } from "@/lib/constants";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  applications: JobApplication[];
  draggingId: number | null;
  dropTarget: ApplicationStatus | null;
  onAdd: (status: ApplicationStatus) => void;
  onCardDragStart: (applicationId: number) => void;
  onCardDragEnd: () => void;
  onCardDrop: (status: ApplicationStatus) => void;
  onDragEnter: (status: ApplicationStatus) => void;
  onEdit: (application: JobApplication) => void;
}

export function KanbanBoard({
  applications,
  draggingId,
  dropTarget,
  onAdd,
  onCardDragStart,
  onCardDragEnd,
  onCardDrop,
  onDragEnter,
  onEdit,
}: KanbanBoardProps) {
  return (
    <div className="custom-scrollbar flex flex-1 items-start gap-6 overflow-x-auto overflow-y-hidden px-margin-mobile pb-8 md:px-margin-desktop">
      {KANBAN_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          applications={applications.filter((app) => app.status === status)}
          draggingId={draggingId}
          isDropTarget={dropTarget === status}
          onAdd={onAdd}
          onCardDragStart={onCardDragStart}
          onCardDragEnd={onCardDragEnd}
          onCardDrop={onCardDrop}
          onDragEnter={onDragEnter}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
