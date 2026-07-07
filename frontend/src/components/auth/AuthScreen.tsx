"use client";

import { FormEvent, useState } from "react";
import { login, register } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { NeoButton } from "@/components/ui/NeoButton";

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
}

type AuthMode = "login" | "register";

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("Student User");
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (mode === "register") {
        await register({ email, password, full_name: fullName });
      }

      const tokenResponse = await login({ email, password });
      setAuthToken(tokenResponse.access_token);
      onAuthenticated(tokenResponse.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Check the API server and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile py-10 md:px-margin-desktop">
      <form
        onSubmit={handleSubmit}
        className="precision-border w-full max-w-md rounded-lg border-outline-variant/40 bg-surface-container-high p-6 shadow-2xl"
      >
        <div className="mb-6">
          <div className="font-[family-name:var(--font-display)] text-2xl tracking-widest text-primary-fixed-dim">
            SuperSQA Job Tracker
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-headline)] text-headline-lg-mobile text-on-surface">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Use the seeded student account or register a new local user.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 border border-outline-variant/30 p-1">
          {(["login", "register"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={
                mode === option
                  ? "bg-primary-container/20 px-3 py-2 text-sm font-semibold text-primary-fixed-dim"
                  : "px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface"
              }
            >
              {option === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <label className="flex flex-col gap-2">
              <span className="field-label">Full Name</span>
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="field-control"
                autoComplete="name"
              />
            </label>
          )}
          <label className="flex flex-col gap-2">
            <span className="field-label">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-control"
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="field-label">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-control"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 border border-error/40 bg-error-container/25 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <NeoButton type="submit" disabled={isSaving} className="mt-6 w-full justify-center py-3">
          <Icon name={mode === "login" ? "login" : "person_add"} className="text-[18px]" />
          {isSaving ? "Please wait" : mode === "login" ? "Sign in" : "Create and sign in"}
        </NeoButton>
      </form>
    </main>
  );
}
