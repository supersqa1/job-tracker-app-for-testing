"use client";

import { cn } from "@/lib/utils";

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export function NeoButton({
  variant = "primary",
  className,
  children,
  ...props
}: NeoButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded px-4 py-2 font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-widest transition-colors disabled:opacity-50",
        variant === "primary" && "neo-glass-btn bg-primary-fixed-dim/10 text-primary-fixed-dim",
        variant === "ghost" &&
          "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
