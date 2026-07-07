import { cn } from "@/lib/utils";

interface GlassPaneProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPane({ children, className }: GlassPaneProps) {
  return (
    <div className={cn("glass-pane precision-border rounded-lg", className)}>
      {children}
    </div>
  );
}
