import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setAuthToken, clearAuthToken } from "@/lib/auth";
import {
  changePassword,
  createApiKey,
  deleteApiKey,
  getApiKeys,
  getCurrentUser,
  updateCurrentUser,
} from "@/lib/api";
import { ApiKeysPanel } from "./ApiKeysPanel";

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    changePassword: vi.fn(),
    createApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
    getApiKeys: vi.fn(),
    getCurrentUser: vi.fn(),
    updateCurrentUser: vi.fn(),
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

const existingKey = {
  id: 10,
  name: "Existing key",
  key_prefix: "jt_live_existing_12",
  is_active: true,
  last_used_at: null,
  expires_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("ApiKeysPanel", () => {
  beforeEach(() => {
    clearAuthToken();
    vi.mocked(changePassword).mockReset();
    vi.mocked(createApiKey).mockReset();
    vi.mocked(deleteApiKey).mockReset();
    vi.mocked(getApiKeys).mockReset();
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(updateCurrentUser).mockReset();
  });

  it("shows login when the settings page is unauthenticated", async () => {
    render(<ApiKeysPanel />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(getApiKeys).not.toHaveBeenCalled();
  });

  it("creates an API key and shows the raw key once", async () => {
    const user = userEvent.setup();
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApiKeys).mockResolvedValue([]);
    vi.mocked(createApiKey).mockResolvedValue({
      ...existingKey,
      id: 11,
      name: "Postman testing key",
      key_prefix: "jt_live_created_12",
      api_key: "jt_live_created_1234567890",
    });

    render(<ApiKeysPanel />);

    await screen.findByRole("heading", { name: "Settings" });
    await user.click(screen.getByRole("button", { name: /create key/i }));

    expect(await screen.findByText("Copy this key now")).toBeInTheDocument();
    expect(screen.getByText("jt_live_created_1234567890")).toBeInTheDocument();
    expect(createApiKey).toHaveBeenCalledWith({ name: "Postman testing key" });
  });

  it("updates the current user's profile", async () => {
    const user = userEvent.setup();
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApiKeys).mockResolvedValue([]);
    vi.mocked(updateCurrentUser).mockResolvedValue({
      ...currentUser,
      full_name: "Updated Student",
    });

    render(<ApiKeysPanel />);

    await screen.findByRole("heading", { name: "Settings" });
    const fullName = screen.getByLabelText("Full Name");
    await user.clear(fullName);
    await user.type(fullName, "Updated Student");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(updateCurrentUser).toHaveBeenCalledWith({
        full_name: "Updated Student",
      });
    });
    expect(screen.getByText("Profile updated.")).toBeInTheDocument();
  });

  it("changes the current user's password", async () => {
    const user = userEvent.setup();
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApiKeys).mockResolvedValue([]);
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(<ApiKeysPanel />);

    await screen.findByRole("heading", { name: "Settings" });
    await user.type(screen.getByLabelText("Current Password"), "Password123!");
    await user.type(screen.getByLabelText("New Password"), "NewPassword123!");
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        current_password: "Password123!",
        new_password: "NewPassword123!",
      });
    });
    expect(screen.getByText("Password updated.")).toBeInTheDocument();
  });

  it("revokes an active API key", async () => {
    const user = userEvent.setup();
    setAuthToken("jwt-token");
    vi.mocked(getCurrentUser).mockResolvedValue(currentUser);
    vi.mocked(getApiKeys).mockResolvedValue([existingKey]);
    vi.mocked(deleteApiKey).mockResolvedValue(undefined);

    render(<ApiKeysPanel />);

    expect(await screen.findByText("Existing key")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Revoke" }));

    await waitFor(() => {
      expect(deleteApiKey).toHaveBeenCalledWith(10);
    });
    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });
});
