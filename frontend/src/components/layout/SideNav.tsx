"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface SideNavProps {
  isPinned: boolean;
  onPinnedChange: (isPinned: boolean) => void;
}

export function SideNav({ isPinned, onPinnedChange }: SideNavProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isHoverSuppressed, setIsHoverSuppressed] = useState(false);
  const isExpanded = isPinned || (isHovered && !isHoverSuppressed);

  function handleTogglePinned() {
    if (isExpanded) {
      onPinnedChange(false);
      setIsHoverSuppressed(true);
      setIsHovered(false);
    } else {
      onPinnedChange(true);
      setIsHoverSuppressed(false);
    }
  }

  return (
    <aside
      onMouseEnter={() => {
        if (!isHoverSuppressed) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsHoverSuppressed(false);
      }}
      className={cn(
        "group fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] flex-col overflow-hidden border-r border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-2xl transition-all duration-300 ease-in-out md:flex",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      <button
        type="button"
        onClick={handleTogglePinned}
        className={cn(
          "mx-2 mt-3 flex h-11 items-center rounded border-l-4 border-transparent p-3 text-on-surface-variant transition-colors hover:bg-surface-variant/30 hover:text-primary-fixed",
          isExpanded ? "justify-end" : "justify-center",
          isPinned && "text-primary-fixed-dim",
        )}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <Icon name={isExpanded ? "keyboard_double_arrow_left" : "keyboard_double_arrow_right"} className="text-[20px]" />
      </button>

      <div
        className={cn(
          "flex items-center gap-4 overflow-hidden whitespace-nowrap p-6 pt-4 transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-high">
          <span className="font-[family-name:var(--font-display)] text-sm font-bold text-primary-fixed-dim">
            SQ
          </span>
        </div>
        <div>
          <div className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
            Job Seeker
          </div>
          <div className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-primary-fixed-dim">
            Precision Mode
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded border-l-4 p-3 transition-colors",
                isActive
                  ? "border-primary-fixed-dim bg-primary-container/10 text-primary-fixed-dim"
                  : "border-transparent text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary-fixed",
              )}
            >
              <Icon name={item.icon} className="ml-1 text-[20px]" />
              <span
                className={cn(
                  "whitespace-nowrap font-[family-name:var(--font-label)] text-xs uppercase transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-20 mt-auto flex flex-col gap-2 px-2 pb-4">
        <Link
          href="#"
          className="flex items-center gap-4 rounded border-l-4 border-transparent p-3 text-on-surface-variant transition-colors hover:bg-surface-variant/30 hover:text-primary-fixed"
        >
          <Icon name="help_outline" className="ml-1 text-[20px]" />
          <span
            className={cn(
              "whitespace-nowrap font-[family-name:var(--font-label)] text-xs uppercase transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0",
            )}
          >
            Support
          </span>
        </Link>
      </div>
    </aside>
  );
}
