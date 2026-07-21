"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCheckIcon, ClipboardListIcon, FileTextIcon, PlusIcon } from "lucide-react";
import { RequestTable } from "@/components/requests/request-table";
import { ErrorNotice, MetricSkeletonGrid, TableSkeleton } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useCompany } from "@/features/company/company-provider";
import { apiPageRequest, apiRequest } from "@/lib/api-client";
import type { PersonalReport, RequestListItem } from "@/types/backend";

export default function DashboardPage() {
  const { user } = useAuth();
  const { companyId, companyPath, membership } = useCompany();
  const query = useQuery({
    queryKey: ["dashboard", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const [report, requests] = await Promise.all([
        apiRequest<PersonalReport>(companyPath("/reports/me")),
        apiPageRequest<RequestListItem>(companyPath("/requests?pageSize=8")),
      ]);
      return { report, requests: requests.items };
    },
  });
  const metrics = query.data
    ? [
        { label: "Requests submitted", value: query.data.report.submitted, icon: FileTextIcon },
        {
          label: "Awaiting my action",
          value: query.data.report.pendingTasks,
          icon: ClipboardListIcon,
        },
        {
          label: "Actions completed",
          value: Object.values(query.data.report.actions).reduce(
            (sum, value) => sum + (value ?? 0),
            0,
          ),
          icon: CheckCheckIcon,
        },
      ]
    : [];
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="Dashboard"
          description={`${membership?.company.name ?? "Company"} workspace for ${user?.fullName ?? "your account"}.`}
          actions={
            <Button render={<Link href="/forms" />}>
              <PlusIcon data-icon="inline-start" /> New request
            </Button>
          }
        />
      </div>
      {query.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <MetricSkeletonGrid />
          <TableSkeleton rows={6} />
        </div>
      )}
      {query.data && (
        <>
          <section className="grid border-b sm:grid-cols-3" aria-label="Workspace summary">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="border-b px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6 lg:px-7"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-[17px]" />
                  </span>
                  <strong className="text-3xl font-semibold tabular-nums">{value}</strong>
                </div>
              </div>
            ))}
          </section>
          <section className="py-6">
            <div className="mb-4 flex items-center justify-between px-4 sm:px-6 lg:px-7">
              <h2 className="text-lg font-semibold">Recent requests</h2>
              <Button variant="ghost" size="sm" render={<Link href="/requests" />}>
                View all
              </Button>
            </div>
            {query.data.requests.length > 0 ? (
              <RequestTable requests={query.data.requests} />
            ) : (
              <p className="border-y p-8 text-center text-sm text-muted-foreground">
                No requests have been submitted in this workspace.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
