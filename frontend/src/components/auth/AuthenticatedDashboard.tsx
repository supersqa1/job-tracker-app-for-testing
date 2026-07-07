"use client";

import { useEffect, useState } from "react";
import { DashboardWorkspace } from "@/components/applications/DashboardWorkspace";
import { AppShell } from "@/components/layout/AppShell";
import { getApplications, getCurrentUser, ApiRequestError } from "@/lib/api";
import { clearAuthToken, hasAuthToken } from "@/lib/auth";
import type { JobApplication, User } from "@/lib/types";
import { AuthScreen } from "./AuthScreen";

export function AuthenticatedDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<JobApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialDashboard() {
      await Promise.resolve();
      if (!isMounted) return;
      if (!hasAuthToken()) {
        setIsLoading(false);
        return;
      }
      await loadDashboard();
    }

    void loadInitialDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const [currentUser, currentApplications] = await Promise.all([
        getCurrentUser(),
        getApplications(),
      ]);
      setUser(currentUser);
      setApplications(currentApplications);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        clearAuthToken();
        setUser(null);
        setApplications(null);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to reach the API. Start the backend on port 3050.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setApplications(null);
    setError(null);
  }

  if (!user && !isLoading) {
    return <AuthScreen onAuthenticated={(nextUser) => {
      setUser(nextUser);
      void loadDashboard();
    }} />;
  }

  return (
    <AppShell user={user} onLogout={handleLogout}>
      {isLoading && (
        <div className="mx-margin-mobile mt-8 md:mx-margin-desktop glass-pane precision-border rounded-lg p-6 text-on-surface-variant">
          Loading pipeline...
        </div>
      )}
      {error && (
        <div className="mx-margin-mobile mt-8 md:mx-margin-desktop glass-pane precision-border rounded-lg p-6 text-on-surface-variant">
          <p className="font-[family-name:var(--font-headline)] text-headline-md text-error">
            Backend unavailable
          </p>
          <p className="mt-2 text-sm">{error}</p>
          <p className="mt-4 font-[family-name:var(--font-mono-data)] text-xs text-outline">
            Run: cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 3050
          </p>
        </div>
      )}
      {applications && <DashboardWorkspace initialApplications={applications} />}
    </AppShell>
  );
}
