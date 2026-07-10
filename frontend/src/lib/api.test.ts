import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthToken, setAuthToken } from "./auth";
import { ApiRequestError, getApplications, getApplicationsPage, login } from "./api";

describe("api client", () => {
  afterEach(() => {
    clearAuthToken();
    vi.unstubAllGlobals();
  });

  it("sends the stored JWT as a bearer token", async () => {
    setAuthToken("jwt-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getApplications();

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer jwt-token",
    );
  });

  it("does not require a stored JWT for login", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "jwt-token",
          token_type: "bearer",
          expires_in: 28800,
          user: {
            id: 1,
            email: "student@example.com",
            full_name: "Student User",
            role: "user",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await login({ email: "student@example.com", password: "Password123!" });

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("Authorization")).toBeNull();
  });

  it("surfaces standardized API error messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "AUTHENTICATION_REQUIRED",
              message: "Authentication required",
              details: [],
            },
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    await expect(getApplications()).rejects.toMatchObject({
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication required",
    } satisfies Partial<ApiRequestError>);
  });

  it("requests paginated applications with stable query parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ items: [], total: 0, limit: 10, offset: 20 }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getApplicationsPage({ limit: 10, offset: 20, search: "qa" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/v1/applications?paginated=true&search=qa&limit=10&offset=20",
    );
  });
});
