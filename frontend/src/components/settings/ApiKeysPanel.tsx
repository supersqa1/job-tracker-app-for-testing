"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import {
  ApiRequestError,
  changePassword,
  createApiKey,
  deleteApiKey,
  getApiKeys,
  getCurrentUser,
  updateCurrentUser,
} from "@/lib/api";
import { clearAuthToken, hasAuthToken } from "@/lib/auth";
import type { ApiKey, User } from "@/lib/types";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Icon } from "@/components/ui/Icon";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ApiKeysPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [profileName, setProfileName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("Postman testing key");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isKeySaving, setIsKeySaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSettings() {
      await Promise.resolve();
      if (!isMounted) return;
      if (!hasAuthToken()) {
        setIsLoading(false);
        return;
      }
      await loadSettings();
    }

    void loadInitialSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);
    try {
      const [currentUser, keys] = await Promise.all([getCurrentUser(), getApiKeys()]);
      setUser(currentUser);
      setProfileName(currentUser.full_name);
      setApiKeys(keys);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        clearAuthToken();
        setUser(null);
      } else {
        setError(err instanceof Error ? err.message : "Unable to load API keys.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsKeySaving(true);
    setError(null);
    setSuccess(null);
    setNewKey(null);
    try {
      const created = await createApiKey({ name });
      setNewKey(created.api_key);
      setApiKeys((current) => [created, ...current]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create API key.");
    } finally {
      setIsKeySaving(false);
    }
  }

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProfileSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateCurrentUser({ full_name: profileName });
      setUser(updated);
      setProfileName(updated.full_name);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPasswordSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handleRevoke(apiKey: ApiKey) {
    setError(null);
    setSuccess(null);
    try {
      await deleteApiKey(apiKey.id);
      setApiKeys((current) =>
        current.map((item) =>
          item.id === apiKey.id ? { ...item, is_active: false } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to revoke API key.");
    }
  }

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setApiKeys([]);
    setNewKey(null);
    setError(null);
    setSuccess(null);
  }

  if (!user && !isLoading) {
    return <AuthScreen onAuthenticated={(nextUser) => {
      setUser(nextUser);
      void loadSettings();
    }} />;
  }

  return (
    <AppShell user={user} onLogout={handleLogout}>
      <div className="custom-scrollbar flex-1 overflow-y-auto px-margin-mobile py-6 md:px-margin-desktop md:py-8">
        <header className="mb-6">
          <h1 className="font-[family-name:var(--font-headline)] text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Settings
          </h1>
          <p className="mt-2 font-[family-name:var(--font-mono-data)] text-sm uppercase tracking-widest text-outline-variant">
            API access and account controls
          </p>
        </header>

        {success && (
          <div className="mb-5 border border-secondary/40 bg-secondary-container/20 p-3 text-sm text-secondary">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 border border-error/40 bg-error-container/25 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-6 xl:grid-cols-2">
          <section className="precision-border rounded-lg border-outline-variant/40 bg-surface-container-high p-5">
            <h2 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
              Profile
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Registration creates normal users. Admin accounts are seeded for
              permission examples and cannot be created from this screen.
            </p>
            <form onSubmit={handleProfileUpdate} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="field-label">Full Name</span>
                <input
                  required
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="field-control"
                  autoComplete="name"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label">Email</span>
                <input
                  readOnly
                  value={user?.email ?? ""}
                  className="field-control opacity-80"
                />
              </label>
              <NeoButton type="submit" disabled={isProfileSaving} className="px-5 py-3">
                <Icon name="person" className="text-[18px]" />
                {isProfileSaving ? "Saving" : "Save Profile"}
              </NeoButton>
            </form>
          </section>

          <section className="precision-border rounded-lg border-outline-variant/40 bg-surface-container-high p-5">
            <h2 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
              Password
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Change the password for the current account. Existing JWTs are not
              revoked in this local course app.
            </p>
            <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="field-label">Current Password</span>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="field-control"
                  autoComplete="current-password"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label">New Password</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="field-control"
                  autoComplete="new-password"
                />
              </label>
              <NeoButton type="submit" disabled={isPasswordSaving} className="px-5 py-3">
                <Icon name="lock_reset" className="text-[18px]" />
                {isPasswordSaving ? "Updating" : "Change Password"}
              </NeoButton>
            </form>
          </section>
        </div>

        <section className="precision-border rounded-lg border-outline-variant/40 bg-surface-container-high p-5">
          <h2 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
            API Keys
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Use API keys for scripts, Postman, or Swagger by sending them in the
            X-API-Key header. The full key is shown once after creation.
          </p>

          <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-[minmax(240px,420px)_auto]">
            <label className="flex flex-col gap-2">
              <span className="field-label">Key Name</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field-control"
                placeholder="Postman testing key"
              />
            </label>
            <NeoButton type="submit" disabled={isKeySaving} className="self-end px-5 py-3">
              <Icon name="key" className="text-[18px]" />
              {isKeySaving ? "Creating" : "Create Key"}
            </NeoButton>
          </form>

          {newKey && (
            <div className="mt-5 border border-secondary/40 bg-secondary-container/20 p-4">
              <div className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-secondary">
                Copy this key now
              </div>
              <code className="mt-2 block break-all font-[family-name:var(--font-mono-data)] text-sm text-on-surface">
                {newKey}
              </code>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="border-b border-outline-variant/30 text-xs uppercase tracking-widest text-outline">
                <tr>
                  <th className="py-3 pr-4 font-[family-name:var(--font-label)]">Name</th>
                  <th className="py-3 pr-4 font-[family-name:var(--font-label)]">Prefix</th>
                  <th className="py-3 pr-4 font-[family-name:var(--font-label)]">Status</th>
                  <th className="py-3 pr-4 font-[family-name:var(--font-label)]">Last Used</th>
                  <th className="py-3 pr-4 font-[family-name:var(--font-label)]">Created</th>
                  <th className="py-3 font-[family-name:var(--font-label)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="py-5 text-on-surface-variant">
                      Loading API keys...
                    </td>
                  </tr>
                )}
                {!isLoading && apiKeys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-5 text-on-surface-variant">
                      No API keys created yet.
                    </td>
                  </tr>
                )}
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b border-outline-variant/15">
                    <td className="py-4 pr-4 text-on-surface">{apiKey.name}</td>
                    <td className="py-4 pr-4 font-[family-name:var(--font-mono-data)] text-primary-fixed-dim">
                      {apiKey.key_prefix}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={apiKey.is_active ? "text-secondary" : "text-outline"}>
                        {apiKey.is_active ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant">
                      {formatDate(apiKey.last_used_at)}
                    </td>
                    <td className="py-4 pr-4 text-on-surface-variant">
                      {formatDate(apiKey.created_at)}
                    </td>
                    <td className="py-4">
                      <button
                        type="button"
                        disabled={!apiKey.is_active}
                        onClick={() => void handleRevoke(apiKey)}
                        className="text-error transition-colors hover:text-error/80 disabled:text-outline disabled:opacity-70"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
