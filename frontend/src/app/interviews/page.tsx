import { AppShell } from "@/components/layout/AppShell";
import { GlassPane } from "@/components/ui/GlassPane";
import { Icon } from "@/components/ui/Icon";

export default function InterviewsPage() {
  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center px-margin-mobile md:px-margin-desktop">
        <GlassPane className="max-w-lg p-8 text-center">
          <Icon
            name="event_upcoming"
            className="mx-auto mb-4 text-[40px] text-tertiary-fixed-dim"
          />
          <h1 className="font-[family-name:var(--font-headline)] text-headline-md text-on-surface">
            Interviews
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Interview schedule and prep tools — scaffolded for a future sprint.
          </p>
        </GlassPane>
      </div>
    </AppShell>
  );
}
