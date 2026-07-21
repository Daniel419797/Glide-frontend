"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, ClipboardCheckIcon, FileTextIcon } from "lucide-react";
import { ErrorNotice, MetricSkeletonGrid } from "@/components/shared/data-states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCompany } from "@/features/company/company-provider";
import { apiRequest } from "@/lib/api-client";
import { formatDateTime, humanize } from "@/lib/format";
import type { PersonalReport } from "@/types/backend";

export default function ReportsPage() {
  const { companyId, companyPath } = useCompany();
  const query = useQuery({
    queryKey: ["personal-report", companyId],
    queryFn: () => apiRequest<PersonalReport>(companyPath("/reports/me")),
    enabled: Boolean(companyId),
  });
  const data = query.data;
  const actionTotal = data
    ? Object.values(data.actions).reduce((sum, value) => sum + (value ?? 0), 0)
    : 0;
  return (
    <div className="min-h-screen">
      <div className="border-b px-4 py-6 sm:px-6 lg:px-7">
        <PageHeader
          title="My reports"
          description="Your request and approval activity in the selected company."
        />
      </div>
      {query.isLoading && (
        <div className="px-4 sm:px-6 lg:px-7">
          <MetricSkeletonGrid />
        </div>
      )}
      {query.isError && (
        <div className="p-4 sm:p-6">
          <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        </div>
      )}
      {data && (
        <>
          <section className="grid border-b sm:grid-cols-3">
            {[
              { label: "Submitted", value: data.submitted, icon: FileTextIcon },
              { label: "Pending tasks", value: data.pendingTasks, icon: ClipboardCheckIcon },
              { label: "Actions completed", value: actionTotal, icon: CheckCircle2Icon },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="border-b p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6 lg:px-7"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Icon className="size-5 text-primary" />
                  <strong className="text-3xl tabular-nums">{value}</strong>
                </div>
              </div>
            ))}
          </section>
          <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:p-7">
            <section>
              <h2 className="font-semibold">Action breakdown</h2>
              <div className="mt-3 divide-y border-y">
                {Object.entries(data.actions).map(([action, count]) => (
                  <div key={action} className="flex justify-between py-3 text-sm">
                    <span>{humanize(action)}</span>
                    <strong className="tabular-nums">{count}</strong>
                  </div>
                ))}
                {Object.keys(data.actions).length === 0 && (
                  <p className="py-6 text-sm text-muted-foreground">No completed actions yet.</p>
                )}
              </div>
            </section>
            <section>
              <h2 className="font-semibold">Recent submissions</h2>
              <div className="mt-3 divide-y border-y">
                {data.recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{request.form.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(request.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={request.status} />
                  </Link>
                ))}
                {data.recentRequests.length === 0 && (
                  <p className="py-6 text-sm text-muted-foreground">No submissions yet.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
