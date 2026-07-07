"use client";

import { useState } from "react";
import { MobileFooter } from "./MobileFooter";
import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const [isSideNavPinned, setIsSideNavPinned] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav user={user} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <SideNav
          isPinned={isSideNavPinned}
          onPinnedChange={setIsSideNavPinned}
        />
        <main
          className={cn(
            "flex flex-1 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-surface-container-high/50 via-background to-background pb-16 transition-[margin] duration-300 ease-in-out md:pb-0",
            isSideNavPinned ? "md:ml-64" : "md:ml-20",
          )}
        >
          {children}
        </main>
      </div>
      <MobileFooter />
    </div>
  );
}
