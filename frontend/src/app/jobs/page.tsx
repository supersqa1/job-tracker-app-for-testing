import { AppShell } from "@/components/layout/AppShell";
import { GlassPane } from "@/components/ui/GlassPane";
import { Icon } from "@/components/ui/Icon";

export default function JobsPage() {
  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center px-margin-mobile md:px-margin-desktop">
        <GlassPane className="max-w-lg p-8 text-center">
          <Icon name="work" className="mx-auto mb-4 text-[40px] text-primary-fixed-dim" />
          <h1 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
            Jobs List
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Full jobs table view coming soon. Use the dashboard kanban for now.
          </p>
        </GlassPane>
      </div>
    </AppShell>
  );
}
