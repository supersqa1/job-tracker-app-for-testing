import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatRelativeDays, getInitials } from "./utils";

describe("getInitials", () => {
  it("uses the first two words in a company name", () => {
    expect(getInitials("Open AI Labs")).toBe("OA");
  });

  it("handles extra whitespace and empty names", () => {
    expect(getInitials("  acme   corp  ")).toBe("AC");
    expect(getInitials("   ")).toBe("");
  });
});

describe("formatRelativeDays", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-27T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats missing, current, past, and future dates", () => {
    expect(formatRelativeDays(null)).toBe("—");
    expect(formatRelativeDays("2026-06-27T08:00:00.000Z")).toBe("Today");
    expect(formatRelativeDays("2026-06-24T12:00:00.000Z")).toBe("3d");
    expect(formatRelativeDays("2026-06-29T12:00:00.000Z")).toBe("in 2d");
  });
});

describe("cn", () => {
  it("joins truthy class names and skips falsey values", () => {
    expect(cn("base", false, null, undefined, "active")).toBe("base active");
  });
});
