"use client";

import { useMemo, useState } from "react";
import type {
  ApplicationStatus,
  JobApplication,
  JobApplicationCreate,
} from "@/lib/types";
import {
  createApplication,
  deleteApplication,
  updateApplication,
} from "@/lib/api";
import { STATUS_CONFIG } from "@/lib/constants";
import { NeoButton } from "@/components/ui/NeoButton";
import { Icon } from "@/components/ui/Icon";
import {
  buildSummary,
  countDueApplications,
  filterApplications,
} from "./dashboard-logic";
import { ApplicationModal } from "./ApplicationModal";
import { KanbanBoard } from "./KanbanBoard";

interface DashboardWorkspaceProps {
  initialApplications: JobApplication[];
}

type ModalState =
  | { mode: "create"; status: ApplicationStatus; application: null }
  | { mode: "edit"; status: ApplicationStatus; application: JobApplication };

export function DashboardWorkspace({
  initialApplications,
}: DashboardWorkspaceProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleApplications = useMemo(() => {
    return filterApplications(applications, normalizedQuery);
  }, [applications, normalizedQuery]);

  const summary = useMemo(() => buildSummary(applications), [applications]);
  const dueCount = useMemo(() => {
    return countDueApplications(applications);
  }, [applications]);

  function openCreate(status: ApplicationStatus = "potential") {
    setFormError(null);
    setModal({ mode: "create", status, application: null });
  }

  function openEdit(application: JobApplication) {
    setFormError(null);
    setModal({ mode: "edit", status: application.status, application });
  }

  async function handleSubmit(payload: JobApplicationCreate) {
    if (!modal) return;
    setIsSaving(true);
    setFormError(null);
    try {
      if (modal.mode === "create") {
        const created = await createApplication(payload);
        setApplications((current) => [created, ...current]);
        setToast("Application added.");
      } else {
        const updated = await updateApplication(modal.application.id, payload);
        setApplications((current) =>
          current.map((application) =>
            application.id === updated.id ? updated : application,
          ),
        );
        setToast("Application updated.");
      }
      setModal(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function moveApplication(status: ApplicationStatus) {
    if (draggingId === null) return;
    const source = applications.find((application) => application.id === draggingId);
    setDraggingId(null);
    setDropTarget(null);
    if (!source || source.status === status) return;

    const previous = applications;
    setApplications((current) =>
      current.map((application) =>
        application.id === source.id ? { ...application, status } : application,
      ),
    );

    try {
      const updated = await updateApplication(source.id, { status });
      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id ? updated : application,
        ),
      );
      setToast(`Moved to ${STATUS_CONFIG[status].label}.`);
    } catch {
      setApplications(previous);
      setToast("Move failed. Status restored.");
    }
  }

  async function archiveApplication(application: JobApplication) {
    const updatedStatus: ApplicationStatus =
      application.status === "withdrawn" ? "potential" : "withdrawn";
    const updated = await updateApplication(application.id, { status: updatedStatus });
    setApplications((current) =>
      current.map((application) =>
        application.id === updated.id ? updated : application,
      ),
    );
  }

  async function deleteCurrentApplication() {
    if (!modal || modal.mode !== "edit") return;
    setIsSaving(true);
    try {
      await deleteApplication(modal.application.id);
      setApplications((current) =>
        current.filter((application) => application.id !== modal.application.id),
      );
      setModal(null);
      setToast("Application deleted.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to delete.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <header className="flex shrink-0 flex-col gap-5 px-margin-mobile py-8 md:px-margin-desktop">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-headline)] text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Active Pipeline
            </h1>
            <p className="mt-2 font-[family-name:var(--font-mono-data)] text-sm uppercase tracking-widest text-outline-variant">
              System Status: Optimal. {summary.total} Tracks Active.
            </p>
          </div>
          <NeoButton className="px-6 py-3" onClick={() => openCreate()}>
            <Icon name="add_circle" className="text-[18px]" />
            New Application
          </NeoButton>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_auto_auto] lg:items-center">
          <label className="relative block">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field-control field-control-with-leading-icon"
              placeholder="Search company, role, location, action"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="border border-outline-variant/30 px-3 py-2 font-[family-name:var(--font-mono-data)] text-xs uppercase tracking-widest text-outline">
              Due Today: {dueCount}
            </span>
            <span className="border border-outline-variant/30 px-3 py-2 font-[family-name:var(--font-mono-data)] text-xs uppercase tracking-widest text-outline">
              Visible: {visibleApplications.length}
            </span>
          </div>
          {toast && (
            <button
              type="button"
              onClick={() => setToast(null)}
              className="border border-secondary/30 px-3 py-2 text-left font-[family-name:var(--font-mono-data)] text-xs uppercase tracking-widest text-secondary"
            >
              {toast}
            </button>
          )}
        </div>
      </header>

      <KanbanBoard
        applications={visibleApplications}
        draggingId={draggingId}
        dropTarget={dropTarget}
        onAdd={openCreate}
        onCardDragStart={setDraggingId}
        onCardDragEnd={() => {
          setDraggingId(null);
          setDropTarget(null);
        }}
        onCardDrop={moveApplication}
        onDragEnter={setDropTarget}
        onEdit={openEdit}
      />

      {modal && (
        <ApplicationModal
          application={modal.application}
          defaultStatus={modal.status}
          isSaving={isSaving}
          error={formError}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      {modal?.mode === "edit" && (
        <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 gap-2 border border-outline-variant/30 bg-surface-container p-2">
          <NeoButton
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={deleteCurrentApplication}
          >
            <Icon name="delete" className="text-[18px]" />
            Delete
          </NeoButton>
          <NeoButton
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={() => archiveApplication(modal.application)}
          >
            <Icon name="archive" className="text-[18px]" />
            Archive
          </NeoButton>
        </div>
      )}
    </>
  );
}
