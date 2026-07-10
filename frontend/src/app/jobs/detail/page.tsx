import { Suspense } from "react";
import { JobDetailFromQuery } from "@/components/applications/JobDetailFromQuery";

export default function JobDetailPage() {
  return (
    <Suspense>
      <JobDetailFromQuery />
    </Suspense>
  );
}
