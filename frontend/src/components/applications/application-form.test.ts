import { describe, expect, it } from "vitest";
import type { JobApplication } from "@/lib/types";
import {
  applicationToForm,
  blankForm,
  emptyToNull,
  formToPayload,
  toDatetimeLocal,
} from "./application-form";

describe("application form helpers", () => {
  it("creates a blank form with the requested default status", () => {
    expect(blankForm("applied")).toMatchObject({
      company_name: "",
      role_title: "",
      status: "applied",
      remote_type: null,
    });
  });

  it("trims optional strings and converts blank values to null", () => {
    expect(emptyToNull("  Seattle  ")).toBe("Seattle");
    expect(emptyToNull("   ")).toBeNull();
    expect(emptyToNull(undefined)).toBeNull();
  });

  it("formats stored dates for datetime-local inputs", () => {
    expect(toDatetimeLocal(null)).toBe("");
    expect(toDatetimeLocal("not a date")).toBe("");
    expect(toDatetimeLocal("2026-06-27T15:45:00.000Z")).toBe("2026-06-27T15:45");
  });

  it("maps an existing application into editable form state", () => {
    const application: JobApplication = {
      id: 7,
      company_name: "Acme",
      role_title: "QA Lead",
      status: "in_progress",
      location: null,
      remote_type: "hybrid",
      salary_range: "$130k",
      job_url: null,
      description: null,
      notes: "Recruiter screen done",
      next_action: "Prep interview",
      next_action_at: "2026-06-30T18:30:00.000Z",
      applied_at: null,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    };

    expect(applicationToForm(application, "potential")).toMatchObject({
      company_name: "Acme",
      role_title: "QA Lead",
      status: "in_progress",
      location: "",
      remote_type: "hybrid",
      next_action_at: "2026-06-30T18:30",
    });
  });

  it("normalizes form state into an API payload", () => {
    expect(
      formToPayload({
        company_name: "  Acme  ",
        role_title: "  QA Lead ",
        status: "final_stage",
        location: "  Remote ",
        remote_type: "remote",
        salary_range: "   ",
        job_url: "",
        description: undefined,
        notes: "  Strong fit ",
        next_action: " ",
        next_action_at: "2026-06-30T10:00",
        applied_at: "",
      }),
    ).toEqual({
      company_name: "Acme",
      role_title: "QA Lead",
      status: "final_stage",
      location: "Remote",
      remote_type: "remote",
      salary_range: null,
      job_url: null,
      description: null,
      notes: "Strong fit",
      next_action: null,
      next_action_at: "2026-06-30T10:00",
      applied_at: null,
    });
  });
});
