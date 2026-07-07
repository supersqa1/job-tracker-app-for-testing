"use client";

import Link from "next/link";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface TopNavProps {
  user?: User | null;
  onLogout?: () => void;
}

export function TopNav({ user, onLogout }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 hidden h-16 w-full items-center justify-between gap-6 border-b border-outline-variant/30 bg-surface/60 px-gutter py-unit shadow-[0_0_15px_rgba(0,242,255,0.1)] backdrop-blur-xl md:flex">
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-display)] text-xl tracking-widest text-primary-fixed-dim xl:text-2xl"
        >
          SuperSQA Job Tracker
        </Link>
        <div className="group relative w-full max-w-sm">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant transition-colors group-focus-within:text-primary-fixed-dim"
          />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full border-0 border-b border-outline-variant/50 bg-transparent py-2 pl-10 pr-4 font-[family-name:var(--font-mono-data)] text-sm text-on-surface placeholder:text-outline-variant/50 transition-all focus:border-primary-fixed-dim focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center text-on-surface-variant transition-colors hover:text-primary-fixed-dim"
          aria-label="Notifications"
        >
          <Icon name="notifications" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-fixed-dim shadow-[0_0_5px_rgba(0,242,255,1)]" />
        </button>
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center text-on-surface-variant transition-colors hover:text-primary-fixed-dim"
          aria-label="Settings"
        >
          <Icon name="settings" />
        </Link>
        {user && (
          <div className="hidden min-w-0 max-w-44 text-right lg:block">
            <div className="truncate font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-on-surface">
              {user.full_name}
            </div>
            <div className="font-[family-name:var(--font-mono-data)] text-[10px] uppercase tracking-widest text-outline">
              {user.role}
            </div>
          </div>
        )}
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary-fixed-dim/50 bg-surface-container-high">
          <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-label)] text-xs text-primary-fixed-dim">
            {user ? getInitials(user.full_name) : "SQ"}
          </div>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center text-on-surface-variant transition-colors hover:text-error"
            aria-label="Logout"
            title="Logout"
          >
            <Icon name="logout" />
          </button>
        )}
      </div>
    </nav>
  );
}
