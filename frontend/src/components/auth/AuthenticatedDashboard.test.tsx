import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";
import { getApplications, getCurrentUser } from "@/lib/api";
import { AuthenticatedDashboard } from "./AuthenticatedDashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getApplications: vi.fn(),
    getCurrentUser: vi.fn(),
  };
});

const currentUser = {
  id: 1,
  email: "student@example.com",
  full_name: "Student User",
  role: "user" as const,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("AuthenticatedDashboard", () => {
  beforeEach(() => {
    clearAuthToken();
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(getApplications).mockReset();
  });

  it("shows the login screen when no token is stored", async () => {
    render(<AuthenticatedDashboard />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("loads the protected dashboard when a token exists", async () => {
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApplications).mockResolvedValue([]);

    render(<AuthenticatedDashboard />);

    expect(await screen.findByText("Active Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Student User")).toBeInTheDocument();
    expect(getApplications).toHaveBeenCalledOnce();
  });

  it("logout clears the token and returns to login", async () => {
    const user = userEvent.setup();
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApplications).mockResolvedValue([]);

    render(<AuthenticatedDashboard />);

    await screen.findByText("Active Pipeline");
    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(getAuthToken()).toBeNull();
    });
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
