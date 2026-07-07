import { cn } from "@/lib/utils";

interface StatusChipProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusChip({ children, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-1 font-[family-name:var(--font-mono-data)] text-[10px] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
