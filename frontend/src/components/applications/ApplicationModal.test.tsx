import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApplicationModal } from "./ApplicationModal";

describe("ApplicationModal", () => {
  it("submits trimmed required fields and normalized optional fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ApplicationModal
        application={null}
        defaultStatus="potential"
        isSaving={false}
        error={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Company"), "  Acme  ");
    await user.type(screen.getByLabelText("Role"), "  QA Engineer ");
    await user.selectOptions(screen.getByLabelText("Status"), "applied");
    await user.selectOptions(screen.getByLabelText("Work Mode"), "remote");
    await user.type(screen.getByLabelText("Location"), "  Seattle ");
    await user.type(screen.getByLabelText("Salary"), "   ");
    await user.type(screen.getByLabelText("Next Action"), " Follow up ");
    await user.click(screen.getByRole("button", { name: /save application/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company_name: "Acme",
        role_title: "QA Engineer",
        status: "applied",
        remote_type: "remote",
        location: "Seattle",
        salary_range: null,
        next_action: "Follow up",
      }),
    );
  });

  it("shows edit mode values and calls close from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ApplicationModal
        application={{
          id: 1,
          company_name: "Globex",
          role_title: "SDET",
          status: "in_progress",
          location: "Austin",
          remote_type: "hybrid",
          salary_range: null,
          job_url: null,
          description: null,
          notes: null,
          next_action: null,
          next_action_at: null,
          applied_at: null,
          created_at: "2026-06-01T00:00:00.000Z",
          updated_at: "2026-06-01T00:00:00.000Z",
        }}
        defaultStatus="potential"
        isSaving={false}
        error="Unable to save."
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Edit Application" })).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toHaveValue("Globex");
    expect(screen.getByText("Unable to save.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close modal" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
