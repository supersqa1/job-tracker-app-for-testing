"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export function MobileFooter() {
  const pathname = usePathname();
  const mobileItems = NAV_ITEMS.filter((item) =>
    ["Dashboard", "Jobs", "Interviews", "Settings"].includes(item.label),
  );

  return (
    <footer className="fixed bottom-0 z-30 flex w-full items-center justify-between border-t border-outline-variant/10 bg-surface-container-lowest/90 px-gutter py-2 backdrop-blur-md md:hidden">
      {mobileItems.slice(0, 2).map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center p-2",
              isActive ? "text-primary-fixed-dim" : "text-outline",
            )}
          >
            <Icon name={item.icon} className="text-[20px]" />
            <span className="mt-1 font-[family-name:var(--font-label)] text-[10px]">
              {item.label === "Dashboard" ? "Dash" : item.label}
            </span>
          </Link>
        );
      })}

      <div className="relative -top-5">
        <button
          type="button"
          className="neo-glass-btn flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary-fixed-dim"
          aria-label="New application"
        >
          <Icon name="add" className="text-[22px]" />
        </button>
      </div>

      {mobileItems.slice(2).map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center p-2",
              isActive ? "text-primary-fixed-dim" : "text-outline",
            )}
          >
            <Icon name={item.icon} className="text-[20px]" />
            <span className="mt-1 font-[family-name:var(--font-label)] text-[10px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </footer>
  );
}
