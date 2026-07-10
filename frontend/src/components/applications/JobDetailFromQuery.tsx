"use client";

import { useSearchParams } from "next/navigation";
import { JobDetailClient } from "./JobDetailClient";

export function JobDetailFromQuery() {
  const searchParams = useSearchParams();
  const applicationId = Number(searchParams.get("id"));

  if (Number.isNaN(applicationId) || applicationId <= 0) {
    return <JobDetailClient applicationId={null} />;
  }

  return <JobDetailClient applicationId={applicationId} />;
}
