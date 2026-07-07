import { notFound } from "next/navigation";
import { JobDetailClient } from "@/components/applications/JobDetailClient";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const applicationId = Number(id);

  if (Number.isNaN(applicationId)) {
    notFound();
  }

  return <JobDetailClient applicationId={applicationId} />;
}
