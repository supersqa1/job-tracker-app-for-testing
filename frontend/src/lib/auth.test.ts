import { describe, expect, it } from "vitest";
import { clearAuthToken, getAuthToken, hasAuthToken, setAuthToken } from "./auth";

describe("auth token storage", () => {
  it("stores and clears the JWT used by the API client", () => {
    clearAuthToken();

    expect(getAuthToken()).toBeNull();
    expect(hasAuthToken()).toBe(false);

    setAuthToken("jwt-token");

    expect(getAuthToken()).toBe("jwt-token");
    expect(hasAuthToken()).toBe(true);

    clearAuthToken();

    expect(getAuthToken()).toBeNull();
  });
});
