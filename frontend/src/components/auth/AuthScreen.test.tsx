import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthToken, getAuthToken } from "@/lib/auth";
import { login, register } from "@/lib/api";
import { AuthScreen } from "./AuthScreen";

vi.mock("@/lib/api", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

const userResponse = {
  id: 1,
  email: "student@example.com",
  full_name: "Student User",
  role: "user" as const,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("AuthScreen", () => {
  beforeEach(() => {
    clearAuthToken();
    vi.mocked(login).mockReset();
    vi.mocked(register).mockReset();
  });

  it("logs in with the seeded student account and stores the JWT", async () => {
    const user = userEvent.setup();
    const onAuthenticated = vi.fn();
    vi.mocked(login).mockResolvedValue({
      access_token: "jwt-token",
      token_type: "bearer",
      expires_in: 28800,
      user: userResponse,
    });

    render(<AuthScreen onAuthenticated={onAuthenticated} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "Password123!",
      });
    });
    expect(getAuthToken()).toBe("jwt-token");
    expect(onAuthenticated).toHaveBeenCalledWith(userResponse);
  });

  it("registers a new user before logging in", async () => {
    const user = userEvent.setup();
    vi.mocked(register).mockResolvedValue(userResponse);
    vi.mocked(login).mockResolvedValue({
      access_token: "new-user-token",
      token_type: "bearer",
      expires_in: 28800,
      user: userResponse,
    });

    render(<AuthScreen onAuthenticated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Register" }));
    await user.click(screen.getByRole("button", { name: /create and sign in/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "Password123!",
        full_name: "Student User",
      });
    });
    expect(login).toHaveBeenCalledOnce();
    expect(getAuthToken()).toBe("new-user-token");
  });

  it("shows a friendly auth error", async () => {
    const user = userEvent.setup();
    vi.mocked(login).mockRejectedValue(new Error("Invalid email or password"));

    render(<AuthScreen onAuthenticated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });
});
