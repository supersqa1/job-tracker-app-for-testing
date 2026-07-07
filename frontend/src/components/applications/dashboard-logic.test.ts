import { describe, expect, it } from "vitest";
import type { JobApplication } from "@/lib/types";
import {
  buildSummary,
  countDueApplications,
  filterApplications,
} from "./dashboard-logic";

function application(
  id: number,
  overrides: Partial<JobApplication> = {},
): JobApplication {
  return {
    id,
    company_name: `Company ${id}`,
    role_title: "QA Engineer",
    status: "potential",
    location: null,
    remote_type: null,
    salary_range: null,
    job_url: null,
    description: null,
    notes: null,
    next_action: null,
    next_action_at: null,
    applied_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildSummary", () => {
  it("counts visible kanban statuses and total applications", () => {
    const applications = [
      application(1, { status: "potential" }),
      application(2, { status: "applied" }),
      application(3, { status: "applied" }),
      application(4, { status: "in_progress" }),
      application(5, { status: "withdrawn" }),
    ];

    expect(buildSummary(applications)).toMatchObject({
      potential: 1,
      applied: 2,
      in_progress: 1,
      final_stage: 0,
      total: 5,
    } satisfies Record<"potential" | "applied" | "in_progress" | "final_stage" | "total", number>);
  });
});

describe("filterApplications", () => {
  it("matches company, role, location, and next action case-insensitively", () => {
    const applications = [
      application(1, {
        company_name: "Acme",
        role_title: "Automation Engineer",
        location: "Seattle",
        next_action: "Email recruiter",
      }),
      application(2, {
        company_name: "Globex",
        role_title: "Manual Tester",
        location: "Austin",
        next_action: "Prepare portfolio",
      }),
    ];

    expect(filterApplications(applications, " acme ")).toEqual([applications[0]]);
    expect(filterApplications(applications, "MANUAL")).toEqual([applications[1]]);
    expect(filterApplications(applications, "seattle")).toEqual([applications[0]]);
    expect(filterApplications(applications, "portfolio")).toEqual([applications[1]]);
    expect(filterApplications(applications, "")).toBe(applications);
  });
});

describe("countDueApplications", () => {
  it("counts actions due through the end of the provided day", () => {
    const applications = [
      application(1, { next_action_at: "2026-06-26T18:00:00.000Z" }),
      application(2, { next_action_at: "2026-06-27T23:59:59.000Z" }),
      application(3, { next_action_at: "2026-06-28T08:00:00.000Z" }),
      application(4, { next_action_at: null }),
    ];

    expect(
      countDueApplications(applications, new Date("2026-06-27T09:00:00.000Z")),
    ).toBe(2);
  });
});
